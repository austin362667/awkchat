import 'package:ChatBooth/helper/authenticate.dart';
import 'package:ChatBooth/helper/helperfunctions.dart';
import 'package:ChatBooth/views/chatPage.dart';
import 'package:ChatBooth/views/chatrooms.dart';
import 'package:flutter/material.dart';

// import 'package:socket_io/socket_io.dart';
// import 'package:socket_io_client/socket_io_client.dart' as IO;

void main() {
  runApp(MyApp());
  // socketio();
}

class MyApp extends StatefulWidget {
  // This widget is the root of your application.
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool userIsLoggedIn;

  @override
  void initState() {
    getLoggedInState();
    super.initState();
  }

  getLoggedInState() async {
    await HelperFunctions.getUserLoggedInSharedPreference().then((value) {
      setState(() {
        userIsLoggedIn = value;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ChatBooth',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: Color(0xff145C9E),
        scaffoldBackgroundColor: Color(0xff1F1F1F),
        accentColor: Color(0xff007EF4),
        fontFamily: "OverpassRegular",
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: userIsLoggedIn != null
          ? userIsLoggedIn
              ? ChatPage()
              : Authenticate()
          : Container(
              child: Center(
                child: Authenticate(),
              ),
            ),
    );
  }
}

// void socketio() {
//   print('socketio started!!');
//   IO.Socket socket = IO.io('https://lattemall.company');
//   socket.on('connect', (_) {
//     print('connect');
//     socket.emit('msg', 'test');
//   });
//   socket.on('event', (data) => print(data));
//   socket.on('disconnect', (_) => print('disconnect'));
//   socket.on('fromServer', (_) => print(_));
//   socket.on('login', (_) => print('歡迎來到 "Chatting Booth" 尬聊小站'));
//   socket.on('user joined', (data) => print("${data.username} 進入了大廳"));
//   socket.on('user left', (data) => print("${data.username} 離開了大廳"));
// }

// import 'package:flutter/foundation.dart';
// import 'package:web_socket_channel/io.dart';
// import 'package:flutter/material.dart';
// import 'package:web_socket_channel/web_socket_channel.dart';

// void main() => runApp(MyApp());

// class MyApp extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     final title = 'WebSocket Demo';
//     return MaterialApp(
//       title: title,
//       home: MyHomePage(
//         title: title,
//         channel: IOWebSocketChannel.connect('ws://lattemall.company'),
//       ),
//     );
//   }
// }

// class MyHomePage extends StatefulWidget {
//   final String title;
//   final WebSocketChannel channel;

//   MyHomePage({Key key, @required this.title, @required this.channel})
//       : super(key: key);

//   @override
//   _MyHomePageState createState() => _MyHomePageState();
// }

// class _MyHomePageState extends State<MyHomePage> {
//   TextEditingController _controller = TextEditingController();

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: Text(widget.title),
//       ),
//       body: Padding(
//         padding: const EdgeInsets.all(20.0),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: <Widget>[
//             Form(
//               child: TextFormField(
//                 controller: _controller,
//                 decoration: InputDecoration(labelText: 'Send a message'),
//               ),
//             ),
//             StreamBuilder(
//               stream: widget.channel.stream,
//               builder: (context, snapshot) {
//                 return Padding(
//                   padding: const EdgeInsets.symmetric(vertical: 24.0),
//                   child: Text(snapshot.hasData ? '${snapshot.data}' : ''),
//                 );
//               },
//             )
//           ],
//         ),
//       ),
//       floatingActionButton: FloatingActionButton(
//         onPressed: _sendMessage,
//         tooltip: 'Send message',
//         child: Icon(Icons.send),
//       ), // This trailing comma makes auto-formatting nicer for build methods.
//     );
//   }

//   void _sendMessage() {
//     if (_controller.text.isNotEmpty) {
//       widget.channel.sink.add(_controller.text);
//     }
//   }

//   @override
//   void dispose() {
//     widget.channel.sink.close();
//     super.dispose();
//   }
// }
