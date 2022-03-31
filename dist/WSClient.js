"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsClientConnecter = exports.WsClient = void 0;
var webSocket_1 = require("rxjs/webSocket");
var WsPackage_1 = __importDefault(require("./WsPackage"));
var WsClient = /** @class */ (function () {
    function WsClient() {
        this._seq = 0;
    }
    WsClient.prototype.connect = function (subsriber) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // connect to the ws-server.
            _this.clientSubject = (0, webSocket_1.webSocket)(__assign(__assign({ openObserver: {
                    next: function () {
                        WsClientConnecter.logMsg(">> [WSClient.Opened] The wss conn success!");
                        resolve(_this.clientSubject);
                    },
                }, closeObserver: {
                    next: function (event) {
                        WsClientConnecter.logMsg(">> [WSCLient.Closed] ", event);
                        reject(event);
                    },
                } }, _this._clientConfig), { serializer: function (msg) {
                    WsClientConnecter.logMsg(">> [starwsc seq] ".concat(_this._seq));
                    var sensBizCodeArr = ["a1001"];
                    if (sensBizCodeArr.indexOf(msg.data.bizCode) === -1) {
                        WsClientConnecter.logMsg(">> [starwsc sendData ".concat(msg.data.bizCode, "]"), msg);
                    }
                    var message = JSON.stringify(msg.data);
                    var wspkg = new WsPackage_1.default(msg.cmd, _this._clientConfig.agent, _this._clientConfig.client, _this._seq++, message);
                    var buf = wspkg.encode();
                    return buf;
                }, deserializer: function (e) {
                    var reader = new FileReader();
                    var p = new Promise(function (resolve, reject) {
                        try {
                            var type = Object.prototype.toLocaleString.call(e.data);
                            if (type === "[object Blob]") {
                                reader.readAsText(e.data, "utf-8");
                                reader.onload = function (e) {
                                    var data = JSON.parse(reader.result);
                                    resolve(data);
                                };
                            }
                        }
                        catch (_a) {
                            reject(e);
                        }
                    });
                    return p;
                } }));
            _this.clientSubject.subscribe(subsriber);
        });
    };
    WsClient.prototype.setConfig = function (config) {
        this.testConfig(config);
        this._clientConfig = config;
    };
    WsClient.prototype.testConfig = function (config) {
        // serializer and deserializer will be overrided by starwsc package
        var fixedConfig = ["serializer", "deserializer"];
        var len = fixedConfig.length;
        var warnStr = fixedConfig.reduce(function (prev, cur, index, arr) {
            if (index < len - 1)
                return "".concat(prev, "\u3001").concat(cur, "\u3001");
            else
                return "".concat(prev, "\u3001").concat(cur);
        });
        for (var key in config) {
            if (fixedConfig.indexOf(key) !== -1) {
                WsClientConnecter.logMsg("%c%s", "color:red", ">> [starwsc config]  ".concat(warnStr, " will be overrided by starwsc package"));
            }
        }
    };
    return WsClient;
}());
exports.WsClient = WsClient;
var WsClientConnecter = /** @class */ (function () {
    function WsClientConnecter() {
    }
    WsClientConnecter.getInstance = function (alias) {
        var _a;
        if (alias === void 0) { alias = "default"; }
        if (this.isWscExists(alias)) {
            return (_a = this._CLIENT_MAP[alias]) === null || _a === void 0 ? void 0 : _a.instance;
        }
        else {
            return new WsClient();
        }
    };
    WsClientConnecter.isWscExists = function (alias) {
        var _a;
        if ((_a = this._CLIENT_MAP) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(alias)) {
            // this.logMsg(`The ${alias} is exists!`);
            return true;
        }
        else {
            // this.logMsg(`Not found the ${alias} ws-client`);
            return false;
        }
    };
    WsClientConnecter.init = function (config, alias) {
        if (alias === void 0) { alias = "default"; }
        // init _enableLog
        if ((config === null || config === void 0 ? void 0 : config.enableLog) === false) {
            this._enableLog = false;
        }
        // No1: Instantiate the ws-client obj.
        var swc = this.getInstance(alias);
        // No2: Set the default ws-client config.
        swc.setConfig(config);
        // No3: The ws-client conn to ws-server.
        var subject = swc.connect(config.callback);
        if (!this.isWscExists(alias)) {
            var client = {
                config: config,
                instance: swc,
            };
            this._CLIENT_MAP[alias] = client;
        }
        return subject;
    };
    // wrapper of console.log
    WsClientConnecter.logMsg = function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        if (this._enableLog) {
            console.log.apply(null, rest);
        }
    };
    /**
     * The singleton
     */
    // The map of ws clients.
    WsClientConnecter._CLIENT_MAP = {};
    WsClientConnecter._enableLog = true;
    return WsClientConnecter;
}());
exports.WsClientConnecter = WsClientConnecter;
