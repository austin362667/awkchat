var express = require('express');
var app = require('express')();
var fs = require('fs');
const { v4: uuidV4 } = require('uuid');

// var enforce = require('express-sslify');
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
const server = https.createServer(options,app).listen(443, () => {
  console.log('listening on *:443');
});;

// var http = require('http')
// const server = http.createServer(app);

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var io = require('socket.io').listen(server);
// require('./router')(app, 'lattemall.company');

const db = require('./queries')

app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)


app.use(function(req, res, next) {
  if(!req.secure) {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/index.html');
});

app.get('/video/full', (req, res) => {
  res.sendFile(__dirname+'/public/videoLobby.html');
});

// let queue = []
// setInterval(async function()
// {
//   console.log('wait in queue: ', queue.length)

// if (queue.length>2){
//   io.on('connection', socket => {
//     for ( p of queue) {
//       socket.emit('join-room', '0000', p.id)//, ROOM_ID
//     }

//   })
// }


// }, 3000)

let tmpRoomId = '';
let tmpNum = 0;
let roomId = '';
app.get('/video', (req, res) => {
  if(tmpNum%2 === 0){
    roomId = uuidV4();
  }else{
    roomId = tmpRoomId;
  }
  tmpRoomId = roomId;
  tmpNum+=1;
  res.redirect(`/video/${roomId}`)
})
//vc3
app.get('/video/:room', (req, res) => {
  console.log('room id: ',req.params.room);
  res.render('video', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('wait-room', (userId) => {

    let player = { id: userId}
    // queue.push(player);

  })
  socket.on('join-room', (roomId, userId) => {
      console.log(roomId, userId)
      socket.join(roomId)
      socket.to(roomId).broadcast.emit('user-connected', userId)

      socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })

    })

})


app.get('/room', (req, res) => {
  return res.redirect('https://lattemall.company');
});

app.get('/match', (req, res) => {
  res.sendFile(__dirname+'/public/room.html');
});

app.get('/bbq', (req, res) => {
  res.sendFile(__dirname+'/public/group.html');
});


app.get('/users/sign_up', (req, res) => {
  res.sendFile(__dirname+'/public/sign_up.html');
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
  key:   socket.id,
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
      io.sockets.in(gameId).emit('leftGame', { gameId: gameId , username: socket.username});
      io.sockets.in(gameId).emit('gameDestroyed', {gameId: gameId, gameOwner: socket.username });
      notInGame = false;
    } 
    else if (plyr2Tmp == socket.username) {
      gameCollection.gameList[i]['gameObject']['playerTwo'] = null;
      console.log(socket.username + " has left " + gameId);
      io.sockets.in(gameId).emit('leftGame', { gameId: gameId , username: socket.username});
      console.log(gameCollection.gameList[i]['gameObject']);
      notInGame = false;

    } 

    for(el of dict){
      // console.log(socket.username, el);
  
        if(socket.id === el['key']){
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
      socket.join(gameCollection.gameList[rndPick]['gameObject']['id']);// join room
      dict.push({
        key:   socket.id,
        value: gameCollection.gameList[rndPick]['gameObject']['id']
      });
      io.sockets.in(gameCollection.gameList[rndPick]['gameObject']['id']).emit('joinSuccess', {
        gameId: gameCollection.gameList[rndPick]['gameObject']['id'] });

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

      if(socket.id === el['key']){
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

      if(socket.id === el['key']){
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

      if(socket.id === el['key']){
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
  
        if(socket.id === el['key']){
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


//video chat
// function findNowRoom(client) {
//   return Object.keys(client.rooms).find(item => {
//     return item !== client.id
//   });
// }

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

//vc2
// io.on('connection', function (socket) {
    
// 	function log(){
//         var array = [">>> Message from server: "];
//         for (var i = 0; i < arguments.length; i++) {
// 	  	    array.push(arguments[i]);
//         }
// 	    socket.emit('log', array);
// 	}

// 	socket.on('message', function (message) {
// 		log('Got message: ', message);
// 		log('socket.room: ', socket.room);
//         socket.broadcast.to(socket.room).emit('message', message);
// 	});
    
// 	socket.on('create or join', function (message) {
// 		log('Got message create or join: ', message);
//         var room = message.room;
//         socket.room = room;
//         var participantID = message.from;
//         configNameSpaceChannel(participantID);
        
// 		var numClients = io.sockets.clients(room).length;

// 		log('Room ' + room + ' has ' + numClients + ' client(s)');
// 		log('Request to create or join room', room);

// 		if (numClients == 0){
// 			socket.join(room);
// 			socket.emit('created', room);
// 		} else {
// 			io.sockets.in(room).emit('join', room);
// 			socket.join(room);
// 			socket.emit('joined', room);
// 		}
// 	});
    
//     // Setup a communication channel (namespace) to communicate with a given participant (participantID)
//     function configNameSpaceChannel(participantID) {
//         var socketNamespace = io.of('/'+participantID);
        
//         socketNamespace.on('connection', function (socket){
//             socket.on('message', function (message) {
//                 // Send message to everyone BUT sender
//                 socket.broadcast.emit('message', message);
//             });
//         });
//     }

// });

//start and listen server
// server.listen(443, () => {
//   console.log('listening on *:443');
// });


// const crypto = require("crypto");
// const jwt  = require('jsonwebtoken');
// const express = require('express');

// const JWT_SECRET = process.env.JWT_SECRET || 'lw4h228vu894y0294y09nc6c72yy98yq98';
// const PLAYER_ID_SALT = process.env.PLAYER_ID_SALT || 'austinisawesome';
// const PLAYER_TIMEOUT = process.env.PLAYER_TIMEOUT || 60000;
// const MATCHMAKER_INTERVAL = process.env.MATCHMAKER_INTERVAL || 3000;
// const PORT = process.env.PORT || 8080;
// const MAX_PLAYER_COUNT = 2;

// const STATE_NOT_IN_QUEUE = 0;
// const STATE_IN_QUEUE = 1;
// const STATE_MATCHED_IN_QUEUE = 2;

// const MATCH_STATES = [
//     {
//         "id": 0,
//         "message": "not in queue."
//     },
//     {
//         "id": 1,
//         "message": "in queue."
//     },
//     {
//         "id": 2,
//         "message": "matched in queue."
//     },
// ];

// var start = Date.now();
// var m_LastMatchJob = start;

// const redis = require('redis').createClient(process.env.REDIS_URL);
// const {promisify} = require('util');
// const hgetallAsync = promisify(redis.hgetall).bind(redis);

// async function LoadDataModel()
// {
//     var data = await hgetallAsync("players");

//     var keys = [];
    
//     if (data != null) {
//         keys = Object.keys(data);
//     }

//     if (data == null)
//         data = [];

//     for(let i=0; i < keys.length; i++) {
//         let json = data[keys[i]];
//         data[keys[i]] = JSON.parse(json);
//     }

//     let dataModel = {
//         "data": data,
//         "keys": keys,
//         "count": keys.length,
//         "updateTtl": function() {
//             redis.expire('players', 60);
//         },
//         "getIndex": function(index) {
//             return this.data[this.keys[index]];
//         },
//         "getById": function(id) {
//             return this.data[id];
//         },
//         "insert": function(player) {
//             redis.hmset("players", player.id, JSON.stringify(player));
//         },
//         "update": function(player) {
//             redis.hmset("players", player.id, JSON.stringify(player));
//         },
//         "delete": function(player) {
//             redis.hdel('players', player.id);
//         },
//         "findWithCriteria": function(id, criteria) {
//             for(let i=0; i < this.count; i++)
//             {
//                 let player = this.getIndex(i);

//                 if( player.criteria === criteria &&
//                     player.matched == false &&
//                     player.id !== id) {
//                         return player;
//                     }
//             }
//             return null;
//         },
//     };

//     return dataModel;
// }

// function CurrentTime() {
//     return Date.now() - start;
// }

// function SHA1(data) {
//     return crypto.createHash("sha1").update(data, "binary").digest("hex");
// }

// function requiresAuth(req, res, next)
// {
//     let access_token = null;
//     if(req.query.access_token) {
//         access_token = req.query.access_token;
//     }
//     else if(req.body.access_token) {
//         access_token = req.body.access_token;
//     } else {
//         res.status(401).json({"error":"missing access_token"});
//         return;
//     }
//     try{
//         req.token = jwt.verify(access_token, JWT_SECRET);
//     } catch(e) {
//         res.status(500).json({"error":e});
//         return;
//     }
//     if(req.token == null) {
//         res.status(500).json({"error":"auth failed"});
//     } else {
//         next();
//     }
// }

// // var engine = express();

// app.use(express.json());

// app.get("/", function(req, res) {
//     res.json({
//             "status" : "ok",
//             "last-job": Date.now() - m_LastMatchJob
//         });
// });

// app.get("/login",function(req, res) {

//     if(!req.query.id) {
//         res.status(500).json({"error":"missing id"});
//         return;
//     }

//     let user_id = SHA1( req.query.id + PLAYER_ID_SALT );

//     let token = jwt.sign({
//         "exp": Math.floor(Date.now() / 1000) + (60 * 60 * 24), //24hr
//         "id": user_id
//       }, JWT_SECRET);

//   res.json({
//       "id": user_id,
//       "token": token
//     });
// });

// app.get("/status", requiresAuth, function(req, res) {
//     res.json({"user" : req.token});
// });

// app.get("/queue/join", requiresAuth, async function(req, res) {

//     let dataModel = await LoadDataModel();

//     dataModel.updateTtl();

//     let player = dataModel.getById(req.token.id);

//     let payload = {
//         "player": player,
//         "state": MATCH_STATES[STATE_IN_QUEUE]
//     };

//     if (player == null)
//     {
//         player = {
//             "id": req.token.id,
//             "matched": false,            
//             "criteria": req.query.criteria ? req.query.criteria : "default",
//             "last_seen": CurrentTime()
//         }
//         payload.player = player;

//         dataModel.insert(player);
//     }
//     else {
//         if(player.matched)
//             payload.state = MATCH_STATES[STATE_MATCHED_IN_QUEUE];
//     }

//     res.json(payload);
// });

// app.get("/queue/poll", requiresAuth, async function(req, res) {

//     let dataModel = await LoadDataModel();

//     dataModel.updateTtl();

//     let player = dataModel.getById(req.token.id);

//     let payload = {};

//     if (player != null)
//     {
//         player.time_since_last_seen = CurrentTime() - player.last_seen;
//         player.last_seen = CurrentTime();
//         payload.player = player;

//         if(player.matched) {
//             payload.state = MATCH_STATES[STATE_MATCHED_IN_QUEUE];
//         } else {
//             payload.state = MATCH_STATES[STATE_IN_QUEUE];
//         }
//     }
//     else {
//         payload.state = MATCH_STATES[STATE_NOT_IN_QUEUE];
//     }

//     res.json(payload);
// });

// app.get("/queue/drop", requiresAuth, async function(req, res) {

//     let dataModel = await LoadDataModel();

//     dataModel.updateTtl();

//     let player = dataModel.getById(req.token.id);

//     if(player != null)
//     {
//         dataModel.delete(player);
//         {
//             res.json({"message":"player removed from queue."});
//         }
//     }
//     else {
//         throw "invalid user_id: " + req.token.id;
//     }
// });

// app.listen(PORT);

// setInterval(async function()
// {
//     let dataModel = null;

//     try {
//         dataModel = await LoadDataModel();
//     } catch(e) {
//         console.log(e);
//     }

//     let now = Date.now();
//     let lastStarted = now - m_LastMatchJob;
//     m_LastMatchJob = now;

//     console.log("Last Matchmaking Job: " + lastStarted + ", in-queue: " + dataModel.count );

//     for(let i=0; i < dataModel.count; i++)
//     {
//         let player = dataModel.getIndex(i);

//             if(player.matched == false)
//             {
//                 let time_since_last_seen = CurrentTime() - player.last_seen;

//                 if(time_since_last_seen > PLAYER_TIMEOUT)
//                 {
//                     console.log("player timed-out: " + player.id);
//                     dataModel.delete(player);
//                     continue;
//                 }

//                 let matched_player = dataModel.findWithCriteria(player.id, player.criteria);

//                 if(matched_player != null)
//                 {
//                     let match_id = crypto.randomBytes(16).toString("hex");

//                     player.matched = true;
//                     matched_player.matched = true;

//                     let match = {
//                         "id": match_id,
//                         "players": [player.id, matched_player.id]
//                     };

//                     player.match = match;
//                     matched_player.match = match;

//                     redis.hmset("players", player.id, JSON.stringify(player));
//                     redis.hmset("players", matched_player.id, JSON.stringify(matched_player));
//                 }     
//             }
//     }
// }, MATCHMAKER_INTERVAL);