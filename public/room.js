$(function() {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
  
    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box
    var $inputMessageBtn = $('.inputMessageBtn'); 
  
    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page
    var $joinGame = $('.joinGame'); 
    var $leaveGame = $('.leaveGame'); 
  
    // Prompt for setting a username
    var username;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();
  
    var socket = io();
  
    function addParticipantsMessage (data) {
      var message = '';
      if (data.numUsers === 1) {
        message += "請按下->進入 開始配對!";//"目前沒有人在線上，轉傳網址邀請好友上來玩！"
      } else {
        message += "這裡有 " + data.numUsers + "  位用戶在線上，按->進入 開始配對！";
      }
      log(message);
    }
  
    // Sets the client's username
    function setUsername () {
      username = cleanInput($usernameInput.val().trim());
  
      // If the username is valid
      if (username) {
        $inputMessage.fadeOut();
        $inputMessageBtn.fadeOut();
        $loginPage.fadeOut();
        $chatPage.show();
        $loginPage.off('click');
        $currentInput = $inputMessage.focus();
  
        // Tell the server your username
        socket.emit('add user', username);
        
      }
    }
  
    // Sends a chat message
    function sendMessage () {
      var message = $inputMessage.val();
      // Prevent markup from being injected into the message
      message = cleanInput(message);
      // if there is a non-empty message and a socket connection
      if (message && connected) {
        $inputMessage.val('');
        addChatMessage({
          username: username,
          message: message
        });
        // tell server to execute 'new message' and send along one parameter
        socket.emit('new message', message);
      }
    }
  
    // Log a message
    function log (message, options) {
      var $el = $('<li>').addClass('log').text(message);
      addMessageElement($el, options);
    }
  
  
  
  
  
  
  
  
    // Adds the visual chat message to the message list
    function addChatMessage (data, options) {
      // Don't fade the message in if there is an 'X was typing'
      var $typingMessages = getTypingMessages(data);
      options = options || {};
      if ($typingMessages.length !== 0) {
        options.fade = false;
        $typingMessages.remove();
      }
  
      var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
      var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);
  
      var typingClass = data.typing ? 'typing' : '';
      var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);
  
      addMessageElement($messageDiv, options);
    }
  
    // Adds the visual chat typing message
    function addChatTyping (data) {
      data.typing = true;
      data.message = 'is typing';
      addChatMessage(data);
    }
  
    // Removes the visual chat typing message
    function removeChatTyping (data) {
      getTypingMessages(data).fadeOut(function () {
        $(this).remove();
      });
    }
  
    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement (el, options) {
      var $el = $(el);
  
      // Setup default options
      if (!options) {
        options = {};
      }
      if (typeof options.fade === 'undefined') {
        options.fade = true;
      }
      if (typeof options.prepend === 'undefined') {
        options.prepend = false;
      }
  
      // Apply options
      if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
      }
      if (options.prepend) {
        $messages.prepend($el);
      } else {
        $messages.append($el);
      }
      $messages[0].scrollTop = $messages[0].scrollHeight;
    }
  
    // Prevents input from having injected markup
    function cleanInput (input) {
      return $('<div/>').text(input).text();
    }
  
    // Updates the typing event
    function updateTyping () {
      if (connected) {
        if (!typing) {
          typing = true;
          socket.emit('typing');
        }
        lastTypingTime = (new Date()).getTime();
  
        setTimeout(function () {
          var typingTimer = (new Date()).getTime();
          var timeDiff = typingTimer - lastTypingTime;
          if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            socket.emit('stop typing');
            typing = false;
          }
        }, TYPING_TIMER_LENGTH);
      }
    }
  
    // Gets the 'X is typing' messages of a user
    function getTypingMessages (data) {
      return $('.typing.message').filter(function (i) {
        return $(this).data('username') === data.username;
      });
    }
  
    // Gets the color of a username through our hash function
    function getUsernameColor (username) {
      // Compute hash code
      var hash = 7;
      for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
     }
      // Calculate color
      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }
  
    // Keyboard events
  
    $window.keydown(function (event) {
      // Auto-focus the current input when a key is typed
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
      }
      // When the client hits ENTER on their keyboard
      if (event.which === 13) {
        if (username) {
          sendMessage();
          socket.emit('stop typing');
          typing = false;
        } else {
          setUsername();
        }
      }
    });
  
    $inputMessage.on('input', function() {
      updateTyping();
    });

    $inputMessageBtn.click(function () {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    });
  
  
    // Click events
  
    // Focus input when clicking anywhere on login page
    $loginPage.click(function () {
      $currentInput.focus();
    });
  
    // Focus input when clicking on the message input's border
    $inputMessage.click(function () {
      $inputMessage.focus();
    });
  
  
    $joinGame.click(function () {
      joinGame();
  
    })
  
    $leaveGame.click(function () {
      leaveGame();
  
    })
  
    // Socket events
  
    // Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
      connected = true;
      // Display the welcome message
      var message = "歡迎來到 'Chatting Booth' 尬聊小站 ";
      log(message, {
        prepend: true
      });
      addParticipantsMessage(data);
    });
  
    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
      console.log(data);
      addChatMessage(data);
    });
  
  
  
    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
      log(data.username + ' 進入了大廳');
      addParticipantsMessage(data);
    });
  
    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
      log(data.username + ' 離開了大廳');
      addParticipantsMessage(data);
      removeChatTyping(data);
  
  
    });
  
    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
      addChatTyping(data);
    });
  
  
    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
      removeChatTyping(data);
    });
  
  
  
  
    socket.on('gameCreated', function (data) {
      console.log("Game Created! ID is: " + data.gameId)
      log(data.username + ' 發起了一場尬聊 ' + data.gameId);
      log(' 系統努力配對中，我們也討厭等待..');
      if ( username == data.username){
        $inputMessage.fadeIn();
        $inputMessageBtn.fadeIn();
      }
      //alert("Game Created! ID is: "+ JSON.stringify(data));
    });
    
    socket.on('disconnect', function () {
     log('抱歉..您已斷線，重開看看吧！');
     $inputMessage.fadeOut();
     $inputMessageBtn.fadeOut();

   });
    
    socket.on('reconnect', function () {
     log('恭喜！！您成功回來了~');
     if (username) {
       socket.emit('add user', username);
       $inputMessage.fadeOut();
       $inputMessageBtn.fadeOut();
     }
   });
    
    socket.on('reconnect_error', function () {
     log('太多人..系統不行了..');
   });
  
  
  //Join into an Existing Game
  function joinGame(){
    socket.emit('joinGame');
  };
  
  socket.on('joinSuccess', function (data) {
    log('High Five！配對成功！您加入了一場尬聊: ' + data.gameId);
    $inputMessage.fadeIn();
    $inputMessageBtn.fadeIn();
  });
  
  
  //Response from Server on existing User found in a game
  socket.on('alreadyJoined', function (data) {
    log('您已經在尬聊中了，重新配對先按->離開');
  });
  
  
  function leaveGame(){
    socket.emit('leaveGame');
    log('太尷尬所以離開了')
    // $inputMessage.fadeOut();
  };
  
  socket.on('leftGame', function (data) {
    if(username === data.username){
      // log('太尷尬所以離開了尬聊 ' + data.gameId);
    }else{
      log('對方離開了尬聊 ' + data.gameId);
    }
    $inputMessage.fadeOut();
    $inputMessageBtn.fadeOut();
  });
  
  socket.on('notInGame', function () {
    log('您還沒開始新的尬聊，按->進入');
    
  });
  
  socket.on('gameDestroyed', function (data) { 
    log( data.gameOwner+ ' 結束了這場尬聊 ' + data.gameId);
    $inputMessage.fadeOut();
  });
  
  });