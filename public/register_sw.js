if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        // registration worked
        console.log('[Service Worker] Registration succeeded. Scope is ' + reg.scope);
        if ('Notification' in window) {
          console.log('Notification permission default status:', Notification.permission);
          // Notification.requestPermission(function (status) {
          //   console.log('Notification permission status:', status);
          // });
        }
      }).catch(error => {
        // registration failed
        console.log('[Service Worker] Registration failed with ' + error);
      });
  }

  // function displayNotification() {
  //   if (Notification.permission == 'granted') {
  //     navigator.serviceWorker.getRegistration().then(reg => {
  //       var options = {
  //         icon: './logo.png',
  //         body: '歡迎加入 Chatting Booth | 尬聊小站',
  //       };
  //       reg.showNotification('Chatting Booth | 尬聊小站', options);
  //       console.log('displayNotification');
  //     });
  //   }
  // }