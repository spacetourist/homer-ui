import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import { Functions } from '@app/helpers/functions';
import { MatTabGroup } from '@angular/material/tabs';
import { AfterViewInit } from '@angular/core';
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

            agentCdr.data.data = Functions.JSON_parse(agentCdr.data.data) || agentCdr.data.data;
            this.jsonData = agentCdr.data;
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
    _interval: any;
    constructor(
      private cdr: ChangeDetectorRef,
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
    }

    ngOnDestroy() {
        if (this._interval) {
            clearInterval(this._interval);
        }
    }

  async getPcap() {

      console.log('saving from data:', this.jsonData)
    //
    // const PREFIX = 'export_';
    // const ext = { Pcap: '.pcap', SIPP: '.xml', Text: '.txt', Report: '.zip' };
    //
    // // todo use jsonData to build request and issue download POST
    //
    //
    //
    // const data = await this._ecs.postMessagesFile(this.getQuery(), type);
    // Functions.saveToFile(data, PREFIX + this.id + '.pcap');
  }
}
