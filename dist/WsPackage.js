"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WsPackage = /** @class */ (function () {
    function WsPackage(cmd, agent, client, seq, message) {
        this.len = 0;
        this.cmd = 0;
        this.agent = 0;
        this.flag = 0;
        this.seq = 0;
        this.crc = 0;
        this.client = 0;
        this.MessageHeaderLen = 20;
        this.cmd = cmd;
        this.agent = agent;
        this.seq = seq;
        this.flag = 0x80;
        this.client = client;
        this.message = message;
    }
    WsPackage.prototype.encode = function () {
        var msgbuf = new TextEncoder().encode(this.message);
        this.len = this.MessageHeaderLen + msgbuf.length;
        this.crc = this.crc32(this.message);
        var buf = new Uint8Array(this.len);
        var hdr = new ArrayBuffer(this.MessageHeaderLen);
        var view = new DataView(hdr, 0, this.MessageHeaderLen);
        view.setUint32(0, this.len, false);
        view.setUint16(4, this.cmd, false);
        view.setUint8(6, this.agent);
        view.setUint8(7, this.flag);
        view.setUint32(8, this.seq, false);
        view.setUint32(12, this.crc, false);
        view.setUint32(16, this.client, false);
        buf.set(new Uint8Array(hdr), 0);
        buf.set(msgbuf, this.MessageHeaderLen);
        return buf.buffer;
    };
    WsPackage.prototype.decode = function (payload) {
        var view = new DataView(payload);
        this.len = view.getUint32(0, false);
        this.cmd = view.getUint16(4, false);
        this.agent = view.getUint8(6);
        this.flag = view.getUint8(7);
        this.seq = view.getUint32(8, false);
        this.crc = view.getUint32(12, false);
        this.client = view.getUint32(16, false);
        this.message = new TextDecoder('utf-8').decode(payload.slice(this.MessageHeaderLen));
        return true;
    };
    WsPackage.prototype.crc32 = function (str) {
        var crcTable = WsPackage.gCrcTable;
        var crc = 0 ^ -1;
        for (var i = 0; i < str.length; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xff];
        }
        return (crc ^ -1) >>> 0;
    };
    WsPackage.makeCRCTable = function () {
        var c;
        var crcTable = [];
        for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            }
            crcTable[n] = c;
        }
        return crcTable;
    };
    WsPackage.gCrcTable = WsPackage.makeCRCTable();
    return WsPackage;
}());
exports.default = WsPackage;
