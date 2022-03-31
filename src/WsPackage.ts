export default class WsPackage {
  static gCrcTable: number[] = WsPackage.makeCRCTable();
  private len: number = 0;
  private cmd: number = 0;
  private agent: number = 0;
  private flag: number = 0;
  private seq: number = 0;
  private crc: number = 0;
  private client: number = 0;
  private message: string;
  private MessageHeaderLen: number = 20;

  constructor(cmd: number, agent: number, client: number, seq: number, message: any) {
    this.cmd = cmd;
    this.agent = agent;
    this.seq = seq;
    this.flag = 0x80;
    this.client = client;
    this.message = message;
  }

  encode(): ArrayBuffer {
    let msgbuf = new TextEncoder().encode(this.message);
    this.len = this.MessageHeaderLen + msgbuf.length;
    this.crc = this.crc32(this.message);
    let buf = new Uint8Array(this.len);
    let hdr = new ArrayBuffer(this.MessageHeaderLen);
    const view = new DataView(hdr, 0, this.MessageHeaderLen);
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
  }

  decode(payload: ArrayBuffer): boolean {
    const view = new DataView(payload);
    this.len = view.getUint32(0, false);
    this.cmd = view.getUint16(4, false);
    this.agent = view.getUint8(6);
    this.flag = view.getUint8(7);
    this.seq = view.getUint32(8, false);
    this.crc = view.getUint32(12, false);
    this.client = view.getUint32(16, false);
    this.message = new TextDecoder('utf-8').decode(payload.slice(this.MessageHeaderLen));
    return true;
  }

  private crc32(str: string): number {
    let crcTable: number[] = WsPackage.gCrcTable;
    let crc: number = 0 ^ -1;

    for (let i: number = 0; i < str.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xff];
    }

    return (crc ^ -1) >>> 0;
  }

  static makeCRCTable(): number[] {
    let c: number;
    let crcTable: number[] = [];
    for (let n: number = 0; n < 256; n++) {
      c = n;
      for (let k: number = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c;
    }
    return crcTable;
  }
}
