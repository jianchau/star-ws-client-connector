// because nodejs does not support Websoket object, test need to run in browser env

import { Observer } from 'rxjs';
import { WsClientConnecter } from '../dist';

const sumObserver = {
  next(p) {
    p.then((data) => console.log('msg: ', data));
  },
  error(err) {
    console.log('err', err);
  },
  complete() {
    console.log('complete');
  },
};

WsClientConnecter.init({
  url: 'url',
  callback: sumObserver,
  agent: 0,
  client: 10000,
});

const subject = WsClientConnecter.getInstance().clientSubject;

let msg = {
  cmd: 100,
  data: {},
};
console.log('发送信息', msg);
subject.next(msg);
