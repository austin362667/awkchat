import { serve } from "https://deno.land/std@0.61.0/http/server.ts";
import { acceptWebSocket, acceptable } from 'https://deno.land/std@0.61.0/ws/mod.ts';
import { chatConnection } from './ws/chatroom.ts';
import { videoConnection } from './ws/videoroom.ts';
import { WebSocket, WebSocketServer } from "https://deno.land/x/websocket/mod.ts";
// import { createRequire } from "https://deno.land/std@0.61.0/node/module.ts";
// import socketio from "https://cdn.pika.dev/socket.io";
// const require = createRequire(import.meta.url);

// server setup
const server = serve({ port: 443 });
console.log("http://localhost:443/");

// import socketio from "https://dev.jspm.io/socket.io"
// const io = require('socket.io')(server);


// import { WebSocket, WebSocketServer } from "https://deno.land/x/websocket@v0.0.3/mod.ts";



// const wss = new WebSocketServer(8080);
// wss.on("connection", function (client) {
//   console.log(`socket 用戶連接 ${client.id}`);

    // console.log({client});

  // client.on('joinRoom', room => {
  //   console.log('room: '+room);
    
  //   const nowRoom = findNowRoom(client);
  //   if (nowRoom) {
  //     client.leave(nowRoom);
  //   }
  //   client.join(room, () => {
  //     wss.sockets.in(room).emit('roomBroadcast', '已有新人加入聊天室！');
  //   });
  // });

  // client.on('peerconnectSignaling', message => {
  //   console.log('接收資料：', message);
 
  //   const nowRoom = findNowRoom(client);
  //   client.to(nowRoom).emit('peerconnectSignaling', message)
  // });

//   client.on('disconnect', () => {
//     console.log(`socket 用戶離開 ${client.id}`);
//   });

// });



// wss.on("connection", function (ws) {
//   console.log(`socket 用戶連接 ${ws.id}`);

//   ws.on('joinRoom', room => {
//     console.log(room);
    
//     const nowRoom = findNowRoom(ws);
//     if (nowRoom) {
//       ws.leave(nowRoom);
//     }
//     // ws.join(room, () => {
//     //   io.sockets.in(room).send('roomBroadcast', '已有新人加入聊天室！');
//     // });
//   });

//   ws.on('peerconnectSignaling', message => {
//     console.log('接收資料：', message);
 
//     const nowRoom = findNowRoom(ws);
//     ws.to(nowRoom).emit('peerconnectSignaling', message)
//   });

//   ws.on('disconnect', () => {
//     console.log(`socket 用戶離開 ${ws.id}`);
//   });

// });


for await (const req of server) {
  
  // serve index page
  if (req.url === '/') {
    req.respond({
      status: 200,
      body: await Deno.open('./public/index.html')
    });
  }

  if (req.url === '/video') {
    req.respond({
      status: 200,
      body: await Deno.open('./public/video.html')
    });
  }

  // accept the websocket connection
  if (req.url === '/ws') {
    if (acceptable(req)) {
      acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers,
      })
      .then(chatConnection);
    }
  }

  if (req.url === '/wsv') {
    if (acceptable(req)) {
      acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers,
      })
      .then(videoConnection);
    }
  }
  
}
