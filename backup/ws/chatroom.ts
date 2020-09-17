import { WebSocket, isWebSocketCloseEvent } from 'https://deno.land/std@0.61.0/ws/mod.ts';
import { v4 } from 'https://deno.land/std@0.61.0/uuid/mod.ts';

let sockets = new Map<string, WebSocket>(); 

interface BroadcastObj {
  name: string,
  mssg: string,
}

// broadcast events to clients
const broadcastEvent = (obj: BroadcastObj) => {
  sockets.forEach((ws: WebSocket) => {
    ws.send(JSON.stringify(obj));
  });
}

const chatConnection = async (ws: WebSocket) => {
  // add new ws connection to map
  const uid = v4.generate();
  sockets.set(uid, ws);
  broadcastEvent({name:'[公告]', mssg:'歡迎新用戶加入！'});
  // listen for websocket events
  for await (const ev of ws) {
    console.log(ev);

    // delete socket if connection closed
    if (isWebSocketCloseEvent(ev)) {
      sockets.delete(uid);
      broadcastEvent({name:'[公告]', mssg:'一位用戶下線了..'});
      break;
    }
    
    // create ev object if ev is string
    if (typeof ev === 'string') {
      let evObj = JSON.parse(ev.toString());
      broadcastEvent(evObj);
    }

  }

};

export { chatConnection };