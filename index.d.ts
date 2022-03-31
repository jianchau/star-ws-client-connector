import { Observer } from "rxjs/internal/types";
import { WebSocketSubject, WebSocketSubjectConfig } from "rxjs/webSocket";
import { WsClient, WsClientConnecter } from "./src/WSClient";
export { WsClient, WsClientConnecter };
/**
 * Ws remote interactive types.
 */
export interface IStarWsInteractive {
	/// Server name or Service name.
	/// eg: 'pharmacy' or 'medservice'
	userAgent: string;
	/// The request id
	requestId: string;
	/// The api router.
	bizCode?: string;
	/// passed data
	data: any;
	[propName: string]: any;
}

// pass data of subject.subscribe
export interface INextMsg {
	cmd: number;
	data: any;
}

// The ws response
export interface IStarWsResponse extends IStarWsInteractive {
	bizCode: string;
	code: string; /// The status code
	data: any; /// Payload
	message: string; /// msg
	requestId: string;
	userAgent: string;
	[propName: stiring]: any;
}

/// Connect params of the target wss.
export interface StarWsClientConfig<T> extends WebSocketSubjectConfig<T> {
	callback: Partial<Observer<T>> | ((value: T) => void); // accept msg from server
	agent: number;
	client: number;
	enableLog?: boolean; // wheather log msg or not
}

export interface StarWsClient {
	/// 客户端配置
	config: StarWsClientConfig<any>;
	/// 客户端实例
	instance: WsClient;
}

export interface StarWsClientMap {
	/// 客户端别名
	[alias: string]: StarWsClient | any;
}

// // 请求类型
// export enum StarRequestType {
//   /// 心跳
//   PING = 100,
//   /// 获取服务器时间
//   SERVER_DATE_TIME = 101,
//   /// 登入
//   SIGN_IN = 102,
//   /// 登出
//   SIGN_OUT = 103,
//   /// 通用查询
//   CRUD = 200,
//   /// 注册
//   REGISTER = 105,
//   /// 获取验证码
//   GET_VERIFY_CODE = 106,
//   /// 验证码校验
//   VERIFY_CODE = 107,
// }

// Agent类型
export enum StarAgentType {
	WEB = 0,
	APP = 1,
	WINDOWS = 2,
	Miniprogram = 3,
}
