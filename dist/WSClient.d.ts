import { StarWsClientConfig } from '..';
import { WebSocketSubject } from 'rxjs/webSocket';
export declare class WsClient {
    static _instance: WsClient | null;
    _clientConfig: StarWsClientConfig<any> | any;
    clientSubject: WebSocketSubject<any> | any;
    private _seq;
    connect(subsriber: any): Promise<WebSocketSubject<any>>;
    setConfig(config: StarWsClientConfig<any>): void;
    testConfig(config: StarWsClientConfig<any>): void;
}
export declare class WsClientConnecter {
    /**
     * The singleton
     */
    private static _CLIENT_MAP;
    static _enableLog: boolean;
    static getInstance(alias?: string): WsClient;
    static isWscExists(alias: string): boolean;
    static init(config: StarWsClientConfig<any>, alias?: string): Promise<WebSocketSubject<any>>;
    static logMsg(...rest: any[]): void;
}
