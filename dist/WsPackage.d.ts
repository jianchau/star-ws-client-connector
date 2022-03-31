export default class WsPackage {
    static gCrcTable: number[];
    private len;
    private cmd;
    private agent;
    private flag;
    private seq;
    private crc;
    private client;
    private message;
    private MessageHeaderLen;
    constructor(cmd: number, agent: number, client: number, seq: number, message: any);
    encode(): ArrayBuffer;
    decode(payload: ArrayBuffer): boolean;
    private crc32;
    static makeCRCTable(): number[];
}
