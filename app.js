var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/video', (req, res) => {
  res.sendFile(__dirname + '/public/video.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

io.on('connection', (socket) => {
  msg = JSON.stringify({name:'[公告]', mssg:'歡迎新用戶加入！'})
  io.emit('chat message', msg);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});


function findNowRoom(client) {
  return Object.keys(client.rooms).find(item => {
    return item !== client.id
  });
}

io.on('connection', client => {
  console.log(`socket 用戶連接 ${client.id}`);

  client.on('joinRoom', room => {
    console.log(room);
    
    const nowRoom = findNowRoom(client);
    if (nowRoom) {
      client.leave(nowRoom);
    }
    client.join(room, () => {
      io.sockets.in(room).emit('roomBroadcast', '已有新人加入聊天室！');
    });
  });

  client.on('peerconnectSignaling', message => {
    console.log('接收資料：', message);
 
    const nowRoom = findNowRoom(client);
    client.to(nowRoom).emit('peerconnectSignaling', message)
  });

  client.on('disconnect', () => {
    console.log(`socket 用戶離開 ${client.id}`);
  });
});

http.listen(443, () => {
  console.log('listening on *:443');
});