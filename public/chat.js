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
    var $enterBtn = $('.enterBtn'); 
  
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
        message += "剛剛有 " + data.numUsers + "0+  位用戶配對成功，按->進入 開始配對！";
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
      
      let color = getUsernameColor(data.username);
      var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', color);
      var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);
      // $messageBodyDiv.css('background-color', color);
  
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
  
    $enterBtn.click(function () {

      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
  });
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
  
  

    function alert_1() {
      log(' 我們也討厭等待，連線倒數25秒..');
    }


    function alert_20() {
      log(' 別離開!就快到了，連線倒數20秒..');
    }

    function alert_10() {
      log(' 系統努力配對中，連線倒數10秒..');
    }

    function alert_5() {
      log(' 哎呀!終於剩5秒..');
    }

    function alert_0() {
      log(' 您做的很好!可惜現在沒有人落單..');
      log(' 再等等看吧!')
    }
  
    var timeoutID_1;
    var timeoutID_2;
    var timeoutID_3;
    var timeoutID_4;
    var timeoutID_5;
    socket.on('gameCreated', function (data) {
      timeoutID_1 = setTimeout(alert_1, 1000);
      timeoutID_2 = setTimeout(alert_20, 7000);
      timeoutID_3 = setTimeout(alert_10, 12000);
      timeoutID_4 = setTimeout(alert_5, 22000);
      timeoutID_5 = setTimeout(alert_0, 27000);
      console.log("Game Created! ID is: " + data.gameId)

      if ( username == data.username){
        log(data.username + ' 發起了一場尬聊 ' + data.gameId);
        // log(' 系統努力配對中，我們也討厭等待..');
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
    log('High Five！配對成功！您加入了一場尬聊 ' + data.gameId);
    log('您已進入1對1聊天室!');
    clearTimeout(timeoutID_1);
    clearTimeout(timeoutID_2);
    clearTimeout(timeoutID_3);
    clearTimeout(timeoutID_4);
    clearTimeout(timeoutID_5);
    $inputMessage.fadeIn();
    $inputMessageBtn.fadeIn();
  });
  
  
  //Response from Server on existing User found in a game
  socket.on('alreadyJoined', function (data) {
    log('您已經在尬聊中了，重新配對先按->離開');
  });
  
  
  function leaveGame(){
    socket.emit('leaveGame');
    clearTimeout(timeoutID_1);
    clearTimeout(timeoutID_2);
    clearTimeout(timeoutID_3);
    clearTimeout(timeoutID_4);
    clearTimeout(timeoutID_5);
    log('太尷尬所以離開了')
    log('轉傳連結給更多好友吧! 搜尋關鍵字：匿名尬聊')
    $inputMessage.fadeOut();
    $inputMessageBtn.fadeOut();
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


// JavaScript Document
document.addEventListener("DOMContentLoaded", function(event) {

	function stackedCards () {

		var stackedOptions = 'Top'; //Change stacked cards view from 'Bottom', 'Top' or 'None'.
		var rotate = true; //Activate the elements' rotation for each move on stacked cards.
		var items = 3; //Number of visible elements when the stacked options are bottom or top.
		var elementsMargin = 10; //Define the distance of each element when the stacked options are bottom or top.
		var useOverlays = true; //Enable or disable the overlays for swipe elements.
		var maxElements; //Total of stacked cards on DOM.
		var currentPosition = 0; //Keep the position of active stacked card.
		var velocity = 0.3; //Minimum velocity allowed to trigger a swipe.
		var topObj; //Keep the swipe top properties.
		var rightObj; //Keep the swipe right properties.
		var leftObj; //Keep the swipe left properties.
		var listElNodesObj; //Keep the list of nodes from stacked cards.
		var listElNodesWidth; //Keep the stacked cards width.
		var currentElementObj; //Keep the stacked card element to swipe.
		var stackedCardsObj;
		var isFirstTime = true;
		var elementHeight;
		var obj;
		var elTrans;
		
		obj = document.getElementById('stacked-cards-block');
		stackedCardsObj = obj.querySelector('.stackedcards-container');
		listElNodesObj = stackedCardsObj.children;
		
		topObj = obj.querySelector('.stackedcards-overlay.top');
		rightObj = obj.querySelector('.stackedcards-overlay.right');
		leftObj = obj.querySelector('.stackedcards-overlay.left');
		
		countElements();
		currentElement();
    changeBackground();
		listElNodesWidth = stackedCardsObj.offsetWidth;
		currentElementObj = listElNodesObj[0];
		updateUi();
		
		//Prepare elements on DOM
		addMargin = elementsMargin * (items -1) + 'px';
		
		if(stackedOptions === "Top"){
	
			for(i = items; i < maxElements; i++){
				listElNodesObj[i].classList.add('stackedcards-top', 'stackedcards--animatable', 'stackedcards-origin-top');
			}
			
			elTrans = elementsMargin * (items - 1);
			
			stackedCardsObj.style.marginBottom = addMargin;
			
		} else if(stackedOptions === "Bottom"){
			
			
			for(i = items; i < maxElements; i++){
				listElNodesObj[i].classList.add('stackedcards-bottom', 'stackedcards--animatable', 'stackedcards-origin-bottom');
			}
			
			elTrans = 0;
			
			stackedCardsObj.style.marginBottom = addMargin;
			
		} else if (stackedOptions === "None"){
			
			for(i = items; i < maxElements; i++){
				listElNodesObj[i].classList.add('stackedcards-none', 'stackedcards--animatable');
			}
			
			elTrans = 0;
		
		}
			
		for(i = items; i < maxElements; i++){
			listElNodesObj[i].style.zIndex = 0;
			listElNodesObj[i].style.opacity = 0;
			listElNodesObj[i].style.webkitTransform ='scale(' + (1 - (items * 0.04)) +') translateX(0) translateY(' + elTrans + 'px) translateZ(0)';
			listElNodesObj[i].style.transform ='scale(' + (1 - (items * 0.04)) +') translateX(0) translateY(' + elTrans + 'px) translateZ(0)';
		}
		
		if(listElNodesObj[currentPosition]){
			listElNodesObj[currentPosition].classList.add('stackedcards-active');
		}
		
		if(useOverlays){
			leftObj.style.transform = 'translateX(0px) translateY(' + elTrans + 'px) translateZ(0px) rotate(0deg)';
			leftObj.style.webkitTransform = 'translateX(0px) translateY(' + elTrans + 'px) translateZ(0px) rotate(0deg)';
			
			rightObj.style.transform = 'translateX(0px) translateY(' + elTrans + 'px) translateZ(0px) rotate(0deg)';
			rightObj.style.webkitTransform = 'translateX(0px) translateY(' + elTrans + 'px) translateZ(0px) rotate(0deg)';
			
			topObj.style.transform = 'translateX(0px) translateY(' + elTrans + 'px) translateZ(0px) rotate(0deg)';
			topObj.style.webkitTransform = 'translateX(0px) translateY(' + elTrans + 'px) translateZ(0px) rotate(0deg)';
			
		} else {
			leftObj.className = '';
			rightObj.className = '';
			topObj.className = '';
			
			leftObj.classList.add('stackedcards-overlay-hidden');
			rightObj.classList.add('stackedcards-overlay-hidden');
			topObj.classList.add('stackedcards-overlay-hidden');
		}
		
		//Remove class init
		setTimeout(function() {
			obj.classList.remove('init');
		},150);
		
		
		function backToMiddle() {
	
			removeNoTransition();
			transformUi(0, 0, 1, currentElementObj); 
	
			if(useOverlays){
				transformUi(0, 0, 0, leftObj);
				transformUi(0, 0, 0, rightObj);
				transformUi(0, 0, 0, topObj);
			}
	
			setZindex(5);
	
			if(!(currentPosition >= maxElements)){
				//roll back the opacity of second element
				if((currentPosition + 1) < maxElements){
					listElNodesObj[currentPosition + 1].style.opacity = '.8';
				}
			}
		};
		
		// Usable functions
		function countElements() {
			maxElements = listElNodesObj.length;
			if(items > maxElements){
				items = maxElements;
			}
		};
		
		//Keep the active card.
		function currentElement() {
		  currentElementObj = listElNodesObj[currentPosition];
		};
		
		//Change background for each swipe.
		function changeBackground() { 
      document.body.classList.add("background-" + currentPosition + "");
		};
		
		//Change states
		function changeStages() {
      if(currentPosition == maxElements){
          //Event listener created to know when transition ends and changes states
          listElNodesObj[maxElements - 1].addEventListener('transitionend', function(){
            document.body.classList.add("background-7");
            document.querySelector('.stage').classList.add('hidden'); 
            document.querySelector('.final-state').classList.remove('hidden');
            document.querySelector('.final-state').classList.add('active');
            listElNodesObj[maxElements - 1].removeEventListener('transitionend', null, false); 
        });
      }
		};
    
		//Functions to swipe left elements on logic external action.
		function onActionLeft() {
			if(!(currentPosition >= maxElements)){
				if(useOverlays) {
					leftObj.classList.remove('no-transition');
					topObj.classList.remove('no-transition');
					leftObj.style.zIndex = '8';
					transformUi(0, 0, 1, leftObj);
	
				}
				
				setTimeout(function() {
					onSwipeLeft();
					resetOverlayLeft();
				},300);
			}
		};
		
		//Functions to swipe right elements on logic external action.
		function onActionRight() {
			if(!(currentPosition >= maxElements)){
				if(useOverlays) {
					rightObj.classList.remove('no-transition');
					topObj.classList.remove('no-transition');
					rightObj.style.zIndex = '8';
					transformUi(0, 0, 1, rightObj);
				}
	
				setTimeout(function(){
					onSwipeRight();
					resetOverlayRight();
				},300);
			}
		};
		
		//Functions to swipe top elements on logic external action.
		function onActionTop() {
			if(!(currentPosition >= maxElements)){
				if(useOverlays) {
					leftObj.classList.remove('no-transition');
					rightObj.classList.remove('no-transition');
					topObj.classList.remove('no-transition');
					topObj.style.zIndex = '8';
					transformUi(0, 0, 1, topObj);
				}
				
				setTimeout(function(){
					onSwipeTop();
					resetOverlays();
				},300); //wait animations end
			}
		};
		
		//Swipe active card to left.
		function onSwipeLeft() {
			removeNoTransition();
			transformUi(-1000, 0, 0, currentElementObj);
			if(useOverlays){
				transformUi(-1000, 0, 0, leftObj); //Move leftOverlay
				transformUi(-1000, 0, 0, topObj); //Move topOverlay
				resetOverlayLeft();
			}
			currentPosition = currentPosition + 1;
			updateUi();
			currentElement();
      changeBackground();
      changeStages();
			setActiveHidden();
		};
		
		//Swipe active card to right.
		function onSwipeRight() {
			removeNoTransition();
			transformUi(1000, 0, 0, currentElementObj);
			if(useOverlays){
				transformUi(1000, 0, 0, rightObj); //Move rightOverlay
				transformUi(1000, 0, 0, topObj); //Move topOverlay
				resetOverlayRight();
			}
	
			currentPosition = currentPosition + 1;
			updateUi();
			currentElement();
      changeBackground();
      changeStages();
			setActiveHidden();
		};
		
		//Swipe active card to top.
		function onSwipeTop() {
			removeNoTransition();
			transformUi(0, -1000, 0, currentElementObj);
			if(useOverlays){
				transformUi(0, -1000, 0, leftObj); //Move leftOverlay
				transformUi(0, -1000, 0, rightObj); //Move rightOverlay
				transformUi(0, -1000, 0, topObj); //Move topOverlay
				resetOverlays();
			}
	
			currentPosition = currentPosition + 1;
			updateUi();
			currentElement();
      changeBackground();
      changeStages();
			setActiveHidden();
		};
		
		//Remove transitions from all elements to be moved in each swipe movement to improve perfomance of stacked cards.
		function removeNoTransition() {
			if(listElNodesObj[currentPosition]){
				
				if(useOverlays) {
					leftObj.classList.remove('no-transition');
					rightObj.classList.remove('no-transition');
					topObj.classList.remove('no-transition');
				}
				
				listElNodesObj[currentPosition].classList.remove('no-transition');
				listElNodesObj[currentPosition].style.zIndex = 6;
			}
			
		};
	
		//Move the overlay left to initial position.
		function resetOverlayLeft() {
			if(!(currentPosition >= maxElements)){
				if(useOverlays){
					setTimeout(function(){
						
						if(stackedOptions === "Top"){
							
							elTrans = elementsMargin * (items - 1);
						
						} else if(stackedOptions === "Bottom" || stackedOptions === "None"){
							
							elTrans = 0;
						
						}
						
						if(!isFirstTime){
							
							leftObj.classList.add('no-transition');
							topObj.classList.add('no-transition');
							
						}
						
						requestAnimationFrame(function(){
							
							leftObj.style.transform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							leftObj.style.webkitTransform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							leftObj.style.opacity = '0';
							
							topObj.style.transform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							topObj.style.webkitTransform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							topObj.style.opacity = '0';
						
						});
						
					},300);
					
					isFirstTime = false;
				}
			}
	   };
	   
		//Move the overlay right to initial position.
		function resetOverlayRight() {
			if(!(currentPosition >= maxElements)){
				if(useOverlays){
					setTimeout(function(){
						
						if(stackedOptions === "Top"){+2
							
							elTrans = elementsMargin * (items - 1);
						
						} else if(stackedOptions === "Bottom" || stackedOptions === "None"){
							
							elTrans = 0;
						
						}
						
						if(!isFirstTime){
							
							rightObj.classList.add('no-transition');
							topObj.classList.add('no-transition');
							
						}
						
						requestAnimationFrame(function(){
							
							rightObj.style.transform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							rightObj.style.webkitTransform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							rightObj.style.opacity = '0';
							
							topObj.style.transform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							topObj.style.webkitTransform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							topObj.style.opacity = '0';
						
						});
	
					},300);
					
					isFirstTime = false;
				}
			}
	   };
	   
		//Move the overlays to initial position.
		function resetOverlays() {
			if(!(currentPosition >= maxElements)){
				if(useOverlays){
	
					setTimeout(function(){
						if(stackedOptions === "Top"){
							
							elTrans = elementsMargin * (items - 1);
						
						} else if(stackedOptions === "Bottom" || stackedOptions === "None"){
	
							elTrans = 0;
	
						}
						
						if(!isFirstTime){
	
							leftObj.classList.add('no-transition');
							rightObj.classList.add('no-transition');
							topObj.classList.add('no-transition');
	
						}
						
						requestAnimationFrame(function(){
	
							leftObj.style.transform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							leftObj.style.webkitTransform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							leftObj.style.opacity = '0';
							
							rightObj.style.transform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							rightObj.style.webkitTransform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							rightObj.style.opacity = '0';
							
							topObj.style.transform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							topObj.style.webkitTransform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
							topObj.style.opacity = '0';
	
						});
	
					},300);	// wait for animations time
					
					isFirstTime = false;							
				}
			}
	   };
		
		function setActiveHidden() {
			if(!(currentPosition >= maxElements)){
				listElNodesObj[currentPosition - 1].classList.remove('stackedcards-active');
				listElNodesObj[currentPosition - 1].classList.add('stackedcards-hidden');
				listElNodesObj[currentPosition].classList.add('stackedcards-active');
			}		 
		};
	
		//Set the new z-index for specific card.
		function setZindex(zIndex) {
			if(listElNodesObj[currentPosition]){
				listElNodesObj[currentPosition].style.zIndex = zIndex;
			}		 
		};
	
    // Remove element from the DOM after swipe. To use this method you need to call this function in onSwipeLeft, onSwipeRight and onSwipeTop and put the method just above the variable 'currentPosition = currentPosition + 1'. 
    //On the actions onSwipeLeft, onSwipeRight and onSwipeTop you need to remove the currentPosition variable (currentPosition = currentPosition + 1) and the function setActiveHidden

		function removeElement() {
      currentElementObj.remove();
      if(!(currentPosition >= maxElements)){
				listElNodesObj[currentPosition].classList.add('stackedcards-active');
			}		
		};
		
		//Add translate X and Y to active card for each frame.
		function transformUi(moveX,moveY,opacity,elementObj) {
			requestAnimationFrame(function(){  
				var element = elementObj;
				
				// Function to generate rotate value 
				function RotateRegulator(value) {
				   if(value/10 > 15) {
					   return 15;
				   }
				   else if(value/10 < -15) {
					   return -15;
				   }
				   return value/10;
				}
				
				if(rotate){
					rotateElement = RotateRegulator(moveX);
				} else {
					rotateElement = 0;
				}
				
				if(stackedOptions === "Top"){
					elTrans = elementsMargin * (items - 1);
					if(element){     
						element.style.webkitTransform = "translateX(" + moveX + "px) translateY(" + (moveY + elTrans) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
						element.style.transform = "translateX(" + moveX + "px) translateY(" + (moveY + elTrans) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
						element.style.opacity = opacity;
					}
				} else if(stackedOptions === "Bottom" || stackedOptions === "None"){
					
					if(element){
						element.style.webkitTransform = "translateX(" + moveX + "px) translateY(" + (moveY) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
						element.style.transform = "translateX(" + moveX + "px) translateY(" + (moveY) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
						element.style.opacity = opacity;
					}
				
				}
			});	  
		};
	
		//Action to update all elements on the DOM for each stacked card.
		function updateUi() {
			requestAnimationFrame(function(){
				elTrans = 0;
				var elZindex = 5;
				var elScale = 1;
				var elOpac = 1;
				var elTransTop = items;
				var elTransInc = elementsMargin;
	
				for(i = currentPosition; i < (currentPosition + items); i++){
					if(listElNodesObj[i]){
						if(stackedOptions === "Top"){
	
							listElNodesObj[i].classList.add('stackedcards-top', 'stackedcards--animatable', 'stackedcards-origin-top');
	
							if(useOverlays){
								leftObj.classList.add('stackedcards-origin-top');
								rightObj.classList.add('stackedcards-origin-top');
								topObj.classList.add('stackedcards-origin-top'); 
							}
	
							elTrans = elTransInc * elTransTop;
							elTransTop--;
	
						} else if(stackedOptions === "Bottom"){
							listElNodesObj[i].classList.add('stackedcards-bottom', 'stackedcards--animatable', 'stackedcards-origin-bottom');
	
							if(useOverlays){
								leftObj.classList.add('stackedcards-origin-bottom');
								rightObj.classList.add('stackedcards-origin-bottom');
								topObj.classList.add('stackedcards-origin-bottom');
							}
	
							elTrans = elTrans + elTransInc;
	
						} else if (stackedOptions === "None"){
	
							listElNodesObj[i].classList.add('stackedcards-none', 'stackedcards--animatable');
							elTrans = elTrans + elTransInc;
	
						}
	
						listElNodesObj[i].style.transform ='scale(' + elScale + ') translateX(0) translateY(' + (elTrans - elTransInc) + 'px) translateZ(0)';
						listElNodesObj[i].style.webkitTransform ='scale(' + elScale + ') translateX(0) translateY(' + (elTrans - elTransInc) + 'px) translateZ(0)';
						listElNodesObj[i].style.opacity = elOpac;
						listElNodesObj[i].style.zIndex = elZindex;
	
						elScale = elScale - 0.04;
						elOpac = elOpac - (1 / items);
						elZindex--;
					}
				}
	
			});
		  
		};
	
		//Touch events block
		var element = obj;
		var startTime;
		var startX;
		var startY;
		var translateX;
		var translateY;
		var currentX;
		var currentY;
		var touchingElement = false;
		var timeTaken;
		var topOpacity;
		var rightOpacity;
		var leftOpacity;
	
		function setOverlayOpacity() {
	
			topOpacity = (((translateY + (elementHeight) / 2) / 100) * -1);
			rightOpacity = translateX / 100;
			leftOpacity = ((translateX / 100) * -1);
			
	
			if(topOpacity > 1) {
				topOpacity = 1;
			}
	
			if(rightOpacity > 1) {
				rightOpacity = 1;
			}
	
			if(leftOpacity > 1) {
				leftOpacity = 1;
			}
		}
		
		function gestureStart(evt) {
			startTime = new Date().getTime();
			
			startX = evt.changedTouches[0].clientX;
			startY = evt.changedTouches[0].clientY;
			
			currentX = startX;
			currentY = startY;
	
			setOverlayOpacity();
			
			touchingElement = true;
			if(!(currentPosition >= maxElements)){
				if(listElNodesObj[currentPosition]){
					listElNodesObj[currentPosition].classList.add('no-transition');
					setZindex(6);
					
					if(useOverlays){
						leftObj.classList.add('no-transition');
						rightObj.classList.add('no-transition');
						topObj.classList.add('no-transition');
					}
					
					if((currentPosition + 1) < maxElements){
						listElNodesObj[currentPosition + 1].style.opacity = '1';
					}
					
					elementHeight = listElNodesObj[currentPosition].offsetHeight / 3;
				}
	
			}
			
		};
		
		function gestureMove(evt) {
			currentX = evt.changedTouches[0].pageX;
			currentY = evt.changedTouches[0].pageY;
			
			translateX = currentX - startX;
			translateY = currentY - startY;
	
			setOverlayOpacity();
			
			if(!(currentPosition >= maxElements)){
				evt.preventDefault();
				transformUi(translateX, translateY, 1, currentElementObj);
	
				if(useOverlays){
					transformUi(translateX, translateY, topOpacity, topObj);
	
					if(translateX < 0){
						transformUi(translateX, translateY, leftOpacity, leftObj);
						transformUi(0, 0, 0, rightObj);
	
					} else if(translateX > 0){
						transformUi(translateX, translateY, rightOpacity, rightObj);
						transformUi(0, 0, 0, leftObj);
					}
	
					if(useOverlays){
						leftObj.style.zIndex = 8;
						rightObj.style.zIndex = 8;
						topObj.style.zIndex = 7;
					}
	
				}
	
			}
			
		};
		
		function gestureEnd(evt) {
			
			if(!touchingElement){
				return;
			}
			
			translateX = currentX - startX;
			translateY = currentY - startY;
			
			timeTaken = new Date().getTime() - startTime;
			
			touchingElement = false;
			
			if(!(currentPosition >= maxElements)){
				if(translateY < (elementHeight * -1) && translateX > ((listElNodesWidth / 2) * -1) && translateX < (listElNodesWidth / 2)){  //is Top?
	
					if(translateY < (elementHeight * -1) || (Math.abs(translateY) / timeTaken > velocity)){ // Did It Move To Top?
						onSwipeTop();
					} else {
						backToMiddle();
					}
	
				} else {
	
					if(translateX < 0){
						if(translateX < ((listElNodesWidth / 2) * -1) || (Math.abs(translateX) / timeTaken > velocity)){ // Did It Move To Left?
							onSwipeLeft();
						} else {
							backToMiddle();
						}
					} else if(translateX > 0) {
						
						if (translateX > (listElNodesWidth / 2) && (Math.abs(translateX) / timeTaken > velocity)){ // Did It Move To Right?
							onSwipeRight();
						} else {
							backToMiddle();
						}
	
					}
				}
			}
		};
		
		element.addEventListener('touchstart', gestureStart, false);
		element.addEventListener('touchmove', gestureMove, false);
		element.addEventListener('touchend', gestureEnd, false);
		
		//Add listeners to call global action for swipe cards
		var buttonLeft = document.querySelector('.left-action');
		var buttonTop = document.querySelector('.top-action');
		var buttonRight = document.querySelector('.right-action');

		buttonLeft.addEventListener('click', onActionLeft, false);
		buttonTop.addEventListener('click', onActionTop, false);
		buttonRight.addEventListener('click', onActionRight, false);

	}
	
	stackedCards();
	
});