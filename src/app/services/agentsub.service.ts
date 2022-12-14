import { HttpGetBuffer } from '@app/helpers/http-get-buffer';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { PreferenceAgentsub } from '@app/models';

@Injectable({
    providedIn: 'root'
})
export class AgentsubService {

    private url = `${environment.apiUrl}/agent`;

    constructor(private http: HttpClient, private httpGetBuffer: HttpGetBuffer) { }

    // Agentsub protokols
    getProtokols(): Observable<PreferenceAgentsub> {
        return this.httpGetBuffer.get<PreferenceAgentsub>(`${this.url}/subscribe`);
    }

    // Agentsub fields
    getFields(): Observable<PreferenceAgentsub> {
        return this.http.get<PreferenceAgentsub>(`${this.url}/fields`);
    }
    /**
     * Perform lookup for data type against HEPSUB subscriber UUID
     *
     * i.e.
     *  search:   http://192.168.181.241:9080/api/v3/agent/search/06a96780-7739-11ed-91e0-fbabc1036a33/pcap
     *  download: http://192.168.181.241:9080/api/v3/agent/search/06a96780-7739-11ed-91e0-fbabc1036a33/download
     */
    getHepsubElements({ uuid, type, data }): Observable<any> {
        return this.http.post<any>(`${this.url}/search/${uuid}/${type}`, data);
    }

    // type = 'cdr' | 'wav' | 'json'
    getType(type: string): Observable<any> {
        return this.http.get<any>(`${this.url}/type/${type}`);
    }

    getAgentCdr(type): Observable<any> {
        /**
         * TODO:
         * transaction dialog / logs / HEPSUB:"test-endpoint"/ cdr
         * as on HOMER [domain:port-1]/dashboard/home
         * [domain:port-1]/api/v3/agent/type/cdr
         */
        return this.http.get(`${this.url}/type/${type}`);

    }

    getData(agent: any, type?: string): Observable<any> {
        // console.log({agent, type});
        const { protocol, host, port, path } = agent;
        const returnDefault = () => new Observable<any>(observer => {
            observer.next(null);
            observer.complete();
        });
        if (protocol !== 'http' && protocol !== 'https') {
            return returnDefault();
        }
        const headers = new HttpHeaders().set('Content-Type', 'application/json');

        try {
            return this.http.post(`${protocol}://${host}:${port}${path}/${type}`, { headers });
        } catch (err) {
            return returnDefault();
        }
    }
}
