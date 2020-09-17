import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "https://deno.land/std@0.60.0/ws/mod.ts";
import { v4 } from 'https://deno.land/std@0.61.0/uuid/mod.ts';

let sockets = new Map<string, WebSocket>(); 

function findNowRoom(client) {
  return Object.keys(client.rooms).find(item => {
    return item !== client.id
  });
}

async function videoConnection(ws: WebSocket) {
  const uid = v4.generate();
  sockets.set(uid, ws);
  console.log("socket connected!");
  try {
    console.log({ws})
    for await (const ev of ws) {
      switch(ev) {
        case "joinRoom":
          console.log(ev);
          break;
      }
      if (typeof ev === "string") {
        // text message
        console.log("ws:Text", ev);
        if (ev==='joinRoom') {
          ws.join('room-0')
          // const nowRoom = findNowRoom();
          // if (nowRoom) {
          //   sock.leave(nowRoom);
          // }
          // sock.join(room, () => {
          //   sock.emit('roomBroadcast', '已有新人加入聊天室！');
          // })
        }
        await ws.send(ev);
      } else if (ev instanceof Uint8Array) {
        // binary message
        console.log("ws:Binary", ev);
      } else if (isWebSocketPingEvent(ev)) {
        const [, body] = ev;
        // ping
        console.log("ws:Ping", body);
      } else if (isWebSocketCloseEvent(ev)) {
        // close
        const { code, reason } = ev;
        console.log("ws:Close", code, reason);
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`);

    if (!ws.isClosed) {
      await ws.close(1000).catch(console.error);
    }
  }
}

export { videoConnection };