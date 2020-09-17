var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
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

http.listen(443, () => {
  console.log('listening on *:3000');
});