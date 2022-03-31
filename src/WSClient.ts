import { StarWsClient, StarWsClientConfig, StarWsClientMap, INextMsg, IStarWsResponse } from "..";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import WsPackage from "./WsPackage";

export class WsClient {
	public static _instance: WsClient | null;
	public _clientConfig: StarWsClientConfig<any> | any;
	public clientSubject: WebSocketSubject<any> | any;
	private _seq: number = 0;
	connect(subsriber: any): Promise<WebSocketSubject<any>> {
		return new Promise((resolve, reject) => {
			// connect to the ws-server.
			this.clientSubject = webSocket({
				openObserver: {
					next: () => {
						WsClientConnecter.logMsg(">> [WSClient.Opened] The wss conn success!");
						resolve(this.clientSubject);
					},
				},
				closeObserver: {
					next: (event: CloseEvent) => {
						WsClientConnecter.logMsg(">> [WSCLient.Closed] ", event);
						reject(event);
					},
				},
				...this._clientConfig,
				serializer: (msg: INextMsg) => {
					WsClientConnecter.logMsg(`>> [starwsc seq] ${this._seq}`);
					const sensBizCodeArr: string[] = ["a1001"];
					if (sensBizCodeArr.indexOf(msg.data.bizCode) === -1) {
						WsClientConnecter.logMsg(`>> [starwsc sendData ${msg.data.bizCode}]`, msg);
					}
					let message = JSON.stringify(msg.data);
					let wspkg = new WsPackage(msg.cmd, this._clientConfig.agent, this._clientConfig.client, this._seq++, message);
					let buf = wspkg.encode();
					return buf;
				},
				deserializer: (e: MessageEvent) => {
					let reader: FileReader = new FileReader();
					let p: Promise<any> = new Promise((resolve: any, reject: any) => {
						try {
							let type: string = Object.prototype.toLocaleString.call(e.data);
							if (type === "[object Blob]") {
								reader.readAsText(e.data, "utf-8");
								reader.onload = function (e) {
									const data: IStarWsResponse = JSON.parse(reader.result as string);
									resolve(data);
								};
							}
						} catch {
							reject(e);
						}
					});
					return p;
				},
			});
			this.clientSubject.subscribe(subsriber);
		});
	}

	setConfig(config: StarWsClientConfig<any>) {
		this.testConfig(config);
		this._clientConfig = config;
	}
	testConfig(config: StarWsClientConfig<any>): void {
		// serializer and deserializer will be overrided by starwsc package
		const fixedConfig: string[] = ["serializer", "deserializer"];
		const len: number = fixedConfig.length;
		const warnStr: string = fixedConfig.reduce((prev, cur, index, arr) => {
			if (index < len - 1) return `${prev}、${cur}、`;
			else return `${prev}、${cur}`;
		});
		for (const key in config) {
			if (fixedConfig.indexOf(key) !== -1) {
				WsClientConnecter.logMsg("%c%s", "color:red", `>> [starwsc config]  ${warnStr} will be overrided by starwsc package`);
			}
		}
	}
}

export class WsClientConnecter {
	/**
	 * The singleton
	 */
	// The map of ws clients.

	private static _CLIENT_MAP: StarWsClientMap = {};
	public static _enableLog: boolean = true;
	static getInstance(alias: string = "default"): WsClient {
		if (this.isWscExists(alias)) {
			return this._CLIENT_MAP[alias]?.instance as WsClient;
		} else {
			return new WsClient();
		}
	}

	static isWscExists(alias: string): boolean {
		if (this._CLIENT_MAP?.hasOwnProperty(alias)) {
			// this.logMsg(`The ${alias} is exists!`);
			return true;
		} else {
			// this.logMsg(`Not found the ${alias} ws-client`);
			return false;
		}
	}
	static init(config: StarWsClientConfig<any>, alias: string = "default"): Promise<WebSocketSubject<any>> {
		// init _enableLog
		if (config?.enableLog === false) {
			this._enableLog = false;
		}
		// No1: Instantiate the ws-client obj.
		const swc: WsClient = this.getInstance(alias);
		// No2: Set the default ws-client config.
		swc.setConfig(config);
		// No3: The ws-client conn to ws-server.
		const subject = swc.connect(config.callback);
		if (!this.isWscExists(alias)) {
			const client: StarWsClient = {
				config,
				instance: swc,
			} as StarWsClient;
			this._CLIENT_MAP[alias] = client;
		}
		return subject;
	}
	// wrapper of console.log
	public static logMsg(...rest: any[]): void {
		if (this._enableLog) {
			console.log.apply(null, rest);
		}
	}
}
