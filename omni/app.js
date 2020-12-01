var express = require('express')
var app = require('express')()
var http = require('http')
// var fs = require('fs');
// const { v4: uuidV4 } = require('uuid');

const server = http.createServer(app).listen(443, () => {
    console.log('listening on *:443')
})
var io = require('socket.io').listen(server)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})    

app.get('/match', (req, res) => {
    res.sendFile(__dirname+'/public/room.html');
});
  
app.use(express.static('public'))

lobbyCnt = 0
currentId = (Math.random()+1).toString(36).slice(2, 18)
io.on('connection', function (socket) {

    socket.on('ready', function (data) {
        // console.log(`userId: ${socket.id} ready...${lobbyCnt}`)

        lobbyCnt++
        socket.join(currentId)

    
        if (lobbyCnt>=6) {
            lobbyCnt = 0
            io.sockets.in(currentId).emit('go')
            // console.log(`roomId: ${currentId} go.`)
            currentId = (Math.random()+1).toString(36).slice(2, 18)
        }
    
    })

    var room = io.sockets.sockets[socket.id].rooms['value']


      // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    socket.emit('login');
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
    //   numUsers: numUsers
    });
  });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
      console.log(room,'-',socket.username,': ',data);
      // we tell the client to execute 'new message'
      socket.in(room).broadcast.emit('new message', {
        username: socket.username,
        message: data
      });
    });
  
    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
      socket.in(room).broadcast.emit('typing', {
        username: socket.username
      });
    });
  
    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
      socket.in(room).broadcast.emit('stop typing', {
        username: socket.username
      });
    });
  
    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
        //   numUsers: numUsers
        });
    });
  
    socket.on('leaveGame', function() {
  
  });
  
  });

