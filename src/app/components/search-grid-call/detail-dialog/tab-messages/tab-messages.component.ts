import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment';
import { Functions } from '@app/helpers/functions';
import { MAT_HAMMER_OPTIONS } from '@angular/material/core';

export interface MesagesData {
    id: string;
    create_date: string;
    timeSeconds: string;
    timeUseconds: string;
    method: string;
    Msg_Size: string;
    srcIp_srcPort: string;
    srcPort: string;
    dstIp_dstPort: string;
    dstPort: string;
    proto: string;
    type: string;
    item: any;
}

@Component({
    selector: 'app-tab-messages',
    templateUrl: './tab-messages.component.html',
    styleUrls: ['./tab-messages.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TabMessagesComponent implements OnInit {
    _dataItem: any;
    _qosData: any;
    @Input() set dataItem(val) {
        this._dataItem = val;
        this.dataSource = Functions.messageFormatter(this._dataItem.data.messages);
    }
    get dataItem () {
        return this._dataItem;
    }
    @Input() set qosData(val) {
        this._qosData = val.rtcp.data;
    }
    get qosData() {
        return this._qosData;
    }
    @Output() messageWindow: EventEmitter<any> = new EventEmitter();

    isWindow = false;

    dataSource: Array<MesagesData> = [];
    displayedColumns: string[] = [
        'id', 'create_date', 'timeSeconds', 'diff',
        'method', 'Msg_Size',
        'srcIp_srcPort', 'dstIp_dstPort',
        // 'aliasDst', 'aliasSrc',
        'dstPort', 'proto', 'type',
    ];

    constructor(private cdr: ChangeDetectorRef) { }
    getAliasByIP (ip) {
        const alias = this.dataItem.data.alias;
        return alias[ip] || ip;
    }
    getMethodColor(method) {
        return Functions.getMethodColor(method);
    }
    ngOnInit() {
        if (!this.dataItem.data.messages.some(item => item.proto === 'rtcp')) {
            this.dataItem.data.messages = this.dataItem.data.messages.concat(this.qosData);
            this.dataItem.data.messages = this.dataItem.data.messages.sort((a, b) => {
                return a.timeSeconds - b.timeSeconds;
            });
        }
        this.dataSource = Functions.messageFormatter(this.dataItem.data.messages);
    }
    onClickMessageRow(row: any, event = null) {
        row.mouseEventData = event;
        this.messageWindow.emit(row);
        this.cdr.detectChanges();
    }

}
