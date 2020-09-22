var express = require('express');
var app = require('express')();
var fs = require('fs');
// const redis = require("redis");
// const path = require("path");

// const subscriber = redis.createClient();
// const publisher = redis.createClient();
// subscriber.on("error", function (err) {
//   console.log("Error " + err);
// });
// publisher.on("error", function (err) {
//   console.log("Error " + err);
// });
var loopLimit = 0;
// room = 0;
// match = [];
var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/lattemall.company/privkey.pem'),
  ca: [fs.readFileSync('/etc/letsencrypt/live/lattemall.company/fullchain.pem')],
  cert: fs.readFileSync('/etc/letsencrypt/live/lattemall.company/fullchain.pem')
};
var https = require('https')

const server = https.createServer(options,app);
var io = require('socket.io')(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/index.html');
});

app.get('/room', (req, res) => {
  res.sendFile(__dirname+'/public/room.html');
});

// app.post('/match', async (req, res) => {
//   // let { queueName, email } = req.body;
//   // queueName = 'match-service';
//   message="austin362667@gmail.com"
//   subscriber.subscribe("waiting room");
// 	res.status(200).send({
// 		"message": "match request queued successfully."
// 	})
// })

app.use(express.static('public'))


// subscriber.on("subscribe", function(channel, count) {
//   console.log("subscribe queued!");
//   publisher.publish(channel, message);
// });

// subscriber.on("message", function(channel, message) {
//   match.push(message);
//   console.log(match.length);
//   console.log("Subscriber received message in channel '" + channel + "': " + message);
//   if (match.length === 2) {
//     console.log("It's two of : ", match);

//       console.log('join room:', room);
//       io.on('connection', (socket) => {
//         socket.join(room);
//       });
//       // io.sockets.in(room).emit('return room', room);

//       room+=1;
//     subscriber.unsubscribe();
//     // subscriber.quit();
//     // publisher.quit();
//     match = [];
//     console.log("Now queue is consumed : ", match);
//   }else{
//     console.log('create room:', room);
//     io.on('connection', (socket) => {
//       socket.join(room);
//     });
//     // io.sockets.in(room).emit('return room', room);

//   }
// });

// app.get('/video', (req, res) => {
//   res.sendFile(__dirname + '/public/video.html');
// });

io.on('connection', (socket) => {
  console.log('a user connected');
  msg = JSON.stringify({name:'[公告]', mssg:'歡迎新用戶加入！'})
  io.emit('chat message', msg);
  socket.on('disconnect', () => {
    console.log('user disconnected');
    msg = JSON.stringify({name:'[公告]', mssg:'一位用戶下線了..'})
    io.emit('chat message', msg);
  });
});

io.on('connection', (socket) => {

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});
//   socket.on('addRoom', room => {
//     socket.join(room)
//     //(1)發送給在同一個 room 中除了自己外的 Client
//     // socket.to(room).emit('addRoom', `已有新人加入 ${room} 聊天室！`)
//     //(2)發送給在 room 中所有的 Client
//     io.sockets.in(room).emit('addRoom', `已加入 ${room} 聊天室！`)
// })

// socket.on('leaveRoom', room => {
//   socket.leave(room);
//   //(1)發送給在同一個 room 中除了自己外的 Client
//   // socket.to(room).emit('addRoom', `已有新人加入 ${room} 聊天室！`)
//   //(2)發送給在 room 中所有的 Client
//   io.sockets.in(room).emit('room chat message', `已離開 ${room} 聊天室！`)
// })

//   socket.on('room chat message', (room, msg) => {
//     console.log(`room: ${room},     msg: ${msg}`)
//     io.sockets.in(room).emit('room chat message', msg);
//   });

// });

// Entire gameCollection Object holds all games and info
var dict = []; // create an empty array


var gameCollection =  new function() {

  this.totalGameCount = 0,
  this.gameList = []

};

function buildGame(socket) {


 var gameObject = {};
 gameObject.id = (Math.random()+1).toString(36).slice(2, 18);
 gameObject.playerOne = socket.username;
 gameObject.playerTwo = null;
 gameCollection.totalGameCount ++;
 gameCollection.gameList.push({gameObject});

 console.log("Game Created by "+ socket.username + " w/ " + gameObject.id);
//  gameId = gameObject.id
socket.join(gameObject.id); // join room 
dict.push({
  key:   socket.username,
  value: gameObject.id
});
 io.sockets.in(gameObject.id).emit('gameCreated', {
  username: socket.username,
  gameId: gameObject.id
});



}

function killGame(socket) {

  var notInGame = true;
  for(var i = 0; i < gameCollection.totalGameCount; i++){

    var gameId = gameCollection.gameList[i]['gameObject']['id']
    var plyr1Tmp = gameCollection.gameList[i]['gameObject']['playerOne'];
    var plyr2Tmp = gameCollection.gameList[i]['gameObject']['playerTwo'];
    
    if (plyr1Tmp == socket.username){
      --gameCollection.totalGameCount; 
      console.log("Destroy Game "+ gameId + "!");
      gameCollection.gameList.splice(i, 1);
      console.log(gameCollection.gameList);
      socket.emit('leftGame', { gameId: gameId });
      socket.emit('gameDestroyed', {gameId: gameId, gameOwner: socket.username });
      notInGame = false;
    } 
    else if (plyr2Tmp == socket.username) {
      gameCollection.gameList[i]['gameObject']['playerTwo'] = null;
      console.log(socket.username + " has left " + gameId);
      socket.emit('leftGame', { gameId: gameId });
      console.log(gameCollection.gameList[i]['gameObject']);
      notInGame = false;

    } 

    for(el of dict){
      // console.log(socket.username, el);
  
        if(socket.username === el['key']){
          socket.leave(el['value']);

          el['key'] = null;
          el['value'] = null;
        }
      }
  }

  if (notInGame == true){
    socket.emit('notInGame');
  }


}

function gameSeeker (socket) {
  ++loopLimit;
  if (( gameCollection.totalGameCount == 0) || (loopLimit >= 20)) {

    buildGame(socket);
    loopLimit = 0;

  } else {
    var rndPick = Math.floor(Math.random() * gameCollection.totalGameCount);
    if (gameCollection.gameList[rndPick]['gameObject']['playerTwo'] == null)
    {
      gameCollection.gameList[rndPick]['gameObject']['playerTwo'] = socket.username;
      let room;
      for(el of dict){
      // console.log(socket.username, el);
  
        if(socket.username === el['key']){
          room = el['value'];
        }
      }
      socket.in(room).broadcast.emit('joinSuccess', {
        gameId: gameCollection.gameList[rndPick]['gameObject']['id'] });
        dict.push({
          key:   socket.username,
          value: gameCollection.gameList[rndPick]['gameObject']['id']
        });
      socket.join(gameCollection.gameList[rndPick]['gameObject']['id']);// join room
        console.log( socket.username + " has been added to: " + gameCollection.gameList[rndPick]['gameObject']['id']);

    } else {

      gameSeeker(socket);
    }
  }
}


// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    
    // console.log("dict", dict);
    let room;
    for(el of dict){
    // console.log(socket.username, el);

      if(socket.username === el['key']){
        room = el['value'];
      }
    }
    console.log(room,'-',socket.username,': ',data);

    // we tell the client to execute 'new message'
    socket.in(room).broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    let room;
    for(el of dict){
    // console.log(socket.username, el);

      if(socket.username === el['key']){
        room = el['value'];
      }
    }
    socket.in(room).broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {

    let room;
    for(el of dict){
    // console.log(socket.username, el);

      if(socket.username === el['key']){
        room = el['value'];
      }
    }
    socket.in(room).broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;
      killGame(socket);

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });


  socket.on('joinGame', function (){
    // console.log(rooms);
    console.log(socket.username + " wants to join a game");

    var alreadyInGame = false;

    for(var i = 0; i < gameCollection.totalGameCount; i++){
      var plyr1Tmp = gameCollection.gameList[i]['gameObject']['playerOne'];
      var plyr2Tmp = gameCollection.gameList[i]['gameObject']['playerTwo'];
      if (plyr1Tmp == socket.username || plyr2Tmp == socket.username){
        alreadyInGame = true;
        console.log(socket.username + " already has a Game!");

        socket.emit('alreadyJoined', {
          gameId: gameCollection.gameList[i]['gameObject']['id']
        });
        break;

      }

    }
    if (alreadyInGame == false){


      gameSeeker(socket);
      
    }

  });


  socket.on('leaveGame', function() {

    for(el of dict){
      // console.log(socket.username, el);
  
        if(socket.username === el['key']){
          socket.leave(el['value']);

          el['key'] = null;
          el['value'] = null;
        }
      }
    if (gameCollection.totalGameCount == 0){
     socket.emit('notInGame');
     
   }

   else {
    killGame(socket);
  }

});

});


// function findNowRoom(client) {
//   return Object.keys(client.rooms).find(item => {
//     return item !== client.id
//   });
// }
// 
// io.on('connection', client => {
//   console.log(`socket 用戶連接 ${client.id}`);

//   client.on('joinRoom', room => {
//     console.log(room);
    
//     const nowRoom = findNowRoom(client);
//     if (nowRoom) {
//       client.leave(nowRoom);
//     }
//     client.join(room, () => {
//       io.sockets.in(room).emit('roomBroadcast', '已有新人加入聊天室！');
//     });
//   });

//   client.on('peerconnectSignaling', message => {
//     console.log('接收資料：', message);
 
//     const nowRoom = findNowRoom(client);
//     client.to(nowRoom).emit('peerconnectSignaling', message)
//   });

//   client.on('disconnect', () => {
//     console.log(`socket 用戶離開 ${client.id}`);
//   });
// });

server.listen(443, () => {
  console.log('listening on *:443');
});