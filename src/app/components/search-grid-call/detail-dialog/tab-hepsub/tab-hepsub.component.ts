import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AgentsubService} from '@app/services/agentsub.service';
import {Functions} from '@app/helpers/functions';
import {MatTabGroup} from '@angular/material/tabs';
import {HttpResponse} from "@angular/common/http";

// todo import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-tab-hepsub',
    templateUrl: './tab-hepsub.component.html',
    styleUrls: ['./tab-hepsub.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabHepsubComponent implements OnInit, OnDestroy, AfterViewInit {
    _dataItem: any;

    @Input() id: any;
    @Input() callid: any;
    @Input() set dataItem(value: any) {
        this._dataItem = value;

        if (this.dataItem.data.heplogs) {
            this.dataLogs = this.dataItem.data.heplogs;
        }
        this.isLogs = this.dataLogs?.length > 0;

        const { agentCdr } = this._dataItem.data;

        if (agentCdr) {
          this.subTabList.push({
              title: agentCdr.node
          });

          console.log('TabHepsubComponent dataItem - agentCdr:', agentCdr)

          // todo do we need this sub data object?
          //agentCdr.data.data = Functions.JSON_parse(agentCdr.data) || agentCdr.data;
          agentCdr.data.data = Functions.JSON_parse(agentCdr.data) || agentCdr.data;

          console.log('TabHepsubComponent dataItem - agentCdr.data:', agentCdr.data)
          console.log('TabHepsubComponent dataItem - agentCdr.data.data:', agentCdr.data.data)

          this.jsonData = agentCdr.data;

          // extract agent node information
          this.agentNode = agentCdr.node;
          this.agentUuid = agentCdr.uuid;
        }

        this.cdr.detectChanges();
    }
    get dataItem(): any {
        return this._dataItem;
    }
    @Input() dataLogs: Array<any>;
    @Input() snapShotTimeRange: any;
    @Output() haveData = new EventEmitter();
    @Output() ready: EventEmitter<any> = new EventEmitter();
    @ViewChild('matTabGroup', { static: false }) matTabGroup: MatTabGroup;
    indexTabPosition = 0;

    isLogs = true;
    subTabList = [];
    jsonData: any;
    timestamp: any; // PCAP timestamp
    timestampString: string; // PCAP timestamp
    agentPathPcap: string;
    agentNode: string;
    agentUuid: string;
    _interval: any;
    constructor(
      private cdr: ChangeDetectorRef,
      private _ass: AgentsubService,
      // todo public translateService: TranslateService,
      ) {
      // todo translateService.addLangs(['en'])
      // todo translateService.setDefaultLang('en')


    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.ready.emit({});
        }, 35)
    }

    ngOnInit() {
        this._interval = setInterval(() => {
            this.matTabGroup.realignInkBar();
            this.cdr.detectChanges();
        }, 2000);

      console.log('TabHepsubComponent ngOnInit - jsonData:', this.jsonData)

      this.agentPathPcap = this.jsonData[this.callid].pcap || 'not_set';
      this.timestamp = this.jsonData[this.callid].t_sec * 1000 || 0;
      this.timestampString = new Date(this.timestamp ).toUTCString();

      console.log('TabHepsubComponent ngOnInit - agentPathPcap:', this.agentPathPcap, 'timestamp:', this.timestamp, 'timestampString:', this.timestampString)
    }

    ngOnDestroy() {
        if (this._interval) {
            clearInterval(this._interval);
        }
    }

  async getPcap() {
    console.log('pcap download request, jsonData:', this.jsonData)

    const request = this.getRequest()

    console.log('pcap download request, request:', request)

    try {
      const blob = await this._ass.getHepsubFile({
        uuid: this.agentUuid,
        type: "download",
        data: request, //this.jsonData
      });

      // produce a timestamped filename
      const timestamp = Functions.getTimestamp();
      const fName = `homer_rtp__${this.callid}__${timestamp}.pcap`;

      console.log('pcap download response, saving to file:', fName)
      Functions.saveToFile(blob, fName);
    } catch (err) {
      console.error('PCAP download error:', err);
      alert('Problem while downloading the file');
      return;
    }
  }

  private getRequest() {
    return {
        param: {
          location: {node: ["local"]}, // todo might be better as node name? copied from pcap search query
          search: {
            ['1_call']: {
              id: 0, // todo we don't have this ID here - where is it from?
              ['callid']: [this.callid], // possibly not needed
              ['sid']: [this.callid], // defined because AgentsubService.DoSearchByPost expects it (superfluous?)
              ['source_ip']: ["1.1.1.1"], // defined because AgentsubService.DoSearchByPost expects it (superfluous?)
              ['pcap']: [this.agentPathPcap], // needed for download (could just load at remote..)
              ['__hep__']: [this.jsonData[this.callid].__hep__], // provide token and filename needed for download
            }
          },
          transaction: {
            call: true,
            registration: false,
            rest: false,
          }
        },
        timestamp: { // todo these not really used, just implementing for testing
          from: this.timestamp,
          to: this.timestamp,
        }
      };

  }
}
