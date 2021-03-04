import 'dart:math';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:joalarm/simple_animations_package.dart';
import 'package:geolocator/geolocator.dart';
import 'package:joalarm/messaging.dart';
import 'package:workmanager/workmanager.dart';
import 'package:joalarm/notification.dart' as notif;
import 'package:http/http.dart';
import 'package:shared_preferences/shared_preferences.dart';

const fetchBackground = "fetchBackground";

void callbackDispatcher() {
  Workmanager.executeTask((task, inputData) async {
    switch (task) {
      case fetchBackground:
        //Geolocator geoLocator = Geolocator()..forceAndroidLocationManager = true;
        Position userLocation = await Geolocator()
            .getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        notif.Notification notification = new notif.Notification();
        notification.showNotificationWithoutSound(userLocation);

        // await _updateUserLocation(userLocation);

        break;
    }
    return Future.value(true);
  });
}

// void main() => runApp(MyApp());

// class MyApp extends StatelessWidget {
//   // This widget is the root of your application.
//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       title: 'Flutter Demo',
//       theme: ThemeData(
//         primarySwatch: Colors.blue,
//       ),
//       home: MyHomePage(title: 'Flutter Demo Home Page'),
//     );
//   }
// }

// class MyHomePage extends StatefulWidget {
//   MyHomePage({Key key, this.title}) : super(key: key);

//   final String title;

//   @override
//   _MyHomePageState createState() => _MyHomePageState();
// }

// class _MyHomePageState extends State<MyHomePage> {
//   @override
//   void initState() {
//     super.initState();

//     // We don't need it anymore since it will be executed in background
//     //this._getUserPosition();

//   Workmanager.initialize(
//     callbackDispatcher,
//     isInDebugMode: true,
//   );

//   Workmanager.registerPeriodicTask(
//     "1",
//     fetchBackground,
//     frequency: Duration(minutes: 15),
//   );
// }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: Text(widget.title),
//       ),
//       body: Center(
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: <Widget>[
//             Text(
//               "hi",
//               style: Theme.of(context).textTheme.headline4,
//             ),
//           ],
//         ),
//       ),
//       floatingActionButton: FloatingActionButton(
//         onPressed: () {
//           createUser();
//         },
//         child: Text('Start'), //result == 200 ? 'Done' :
//       ),
//     );
//   }
// }

// BaseOptions options = new BaseOptions(
//   baseUrl: "http://66.228.52.222:3000",
//   connectTimeout: 10000,
//   receiveTimeout: 3000,
// );

// void createUser() async {
//   Response response;
//   Dio dio = new Dio(options);
//   String name = "Austin";
//   String long = '121';
//   String lat = '24';
//   response = await dio.get("/createUser/cccc/121.5/24.5"); //$name/$long/$lat
//   print(response.data.toString() + response.statusCode.toString());
// }
String serverResponse = 'Hi';
String cnt = '0';

void main() => runApp(MaterialApp(
      title: 'Joalarm',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
      ),
      initialRoute: '/',
      routes: {
        // When navigating to the "/" route, build the FirstScreen widget.
        '/': (context) => BodyWidget(),
        // When navigating to the "/second" route, build the SecondScreen widget.
        '/second': (context) => SecondRoute(),
      },
    ));

// class MyApp extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       title: 'Joalarm',
//       debugShowCheckedModeBanner: false,
//       theme: ThemeData(
//         primarySwatch: Colors.deepPurple,
//       ),
//       home: Scaffold(
//         appBar: AppBar(title: Text('Joalarm')),
//         body: BodyWidget(),
//         floatingActionButton: FloatingActionButton(
//             child: Text('...'),
//             onPressed: () {
//               Navigator.push(
//                 context,
//                 MaterialPageRoute(builder: (context) => RegisterPage()),
//               );
//             }),
//       ),
//     );
//   }
// }

class BodyWidget extends StatefulWidget {
  @override
  BodyWidgetState createState() {
    return new BodyWidgetState();
  }
}

class BodyWidgetState extends State<BodyWidget> {
  FirebaseMessaging _firebaseMessaging;

  @override
  void initState() async {
    super.initState();
    _firebaseMessaging = configureMessaging();
    Workmanager.initialize(
      callbackDispatcher,
      isInDebugMode: true,
    );
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      serverResponse = 'Hi ' + prefs.getString('user_id');
    });
    Response res = await get(
        "http://66.228.52.222:3000/userId/${prefs.getString('user_id')}");
    String userCnt = res.body.toString().split(':"')[4].split('"')[0];

    setState(() {
      cnt = userCnt;
    });
    Workmanager.registerPeriodicTask(
      "1",
      fetchBackground,
      frequency: Duration(minutes: 15),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Joalarm'),
      ),
      body: Center(
        child: Stack(
          children: <Widget>[
            Positioned.fill(child: AnimatedBackground()),
            Positioned.fill(child: Particles(30)),
            Positioned.fill(child: CenteredText()),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        child: Text('...'),
        onPressed: () {
          // Navigate to the second screen using a named route.
          Navigator.pushNamed(context, '/second');
        },
      ),
    );
  }
}

class RegisterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Register Page'),
      ),
      body: Center(),
    );
  }
}

class SecondRoute extends StatelessWidget {
  final TextEditingController nameController = new TextEditingController();
  final TextEditingController followeeController = new TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text("Setting"),
        ),
        body: Column(
          children: <Widget>[
            Container(
              alignment: Alignment.center,
              child: Row(
                children: [
                  Container(
                      width: 100,
                      alignment: Alignment.center,
                      child: TextField(
                        controller: nameController,
                        decoration: InputDecoration(
                          hintText: "真實姓名..",
                          // suffixIcon: IconButton(
                          //   onPressed: _createUser(),
                          //   icon: Icon(Icons.done),
                          // ),
                        ),
                      )),
                  ElevatedButton(
                      onPressed: () {
                        _createUser();
                      },
                      child: Icon(Icons.done))
                ],
              ),
            ),
            Container(
              alignment: Alignment.center,
              child: Row(
                children: [
                  Container(
                      width: 100,
                      alignment: Alignment.center,
                      child: TextField(
                        controller: followeeController,
                        decoration: InputDecoration(
                          hintText: "關注姓名..",
                          // suffixIcon: IconButton(
                          //   onPressed: _createUser(),
                          //   icon: Icon(Icons.done),
                          // ),
                        ),
                      )),
                  ElevatedButton(
                      onPressed: () {
                        _createFollow();
                      },
                      child: Icon(Icons.done))
                ],
              ),
            )
          ],
        )
        // Column(
        //   crossAxisAlignment: CrossAxisAlignment.center,
        //   children: <Widget>[
        // TextField(
        //   controller: nameController,
        //   decoration: InputDecoration(
        //     hintText: "真實姓名..",
        //     suffixIcon: IconButton(
        //       onPressed: _createUser(),
        //       icon: Icon(Icons.done),
        //     ),
        //   ),
        // ),
        //     TextField(
        //       controller: followeeController,
        //       decoration: InputDecoration(
        //         hintText: "關注姓名..",
        //         suffixIcon: IconButton(
        //           onPressed: _createFollow(),
        //           icon: Icon(Icons.done),
        //         ),
        //       ),
        //     ),
        //   ],
        // ),

        // ElevatedButton(
        //   onPressed: () {
        //     // Navigate back to first route when tapped.
        //   },
        //   child: Text('Go back!'),
        // ),
        );
  }

  _createUser() async {
    Response response;
    SharedPreferences prefs;
    if (nameController.text.isNotEmpty) {
      String userName = nameController.text;
      String fmsToken = await firebaseMessaging.getToken();
      response = await get(
          "http://66.228.52.222:3000/createUser/$userName/0/0/$fmsToken");

      prefs = await SharedPreferences.getInstance();
      prefs.setString(
          'user_id', response.body.toString().split(':')[1].split('}')[0]);

      // setState(() {
      //   serverResponse = response.body.toString() + ' ' + fmsToken;
      // });
    }
    // setState(() {
    //   serverResponse = 'Hi ' + prefs.getString('user_id');
    // });
  }

  _createFollow() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();

    String followerId = prefs.getString('user_id');
    String followeeName = followeeController.text;
    prefs.setString('followee_name', followeeName);
    Response response =
        await get("http://66.228.52.222:3000/userName/$followeeName");
    String followeeId = response.body.toString().split(':')[1].split(',')[0];
    await get("http://66.228.52.222:3000/createFollow/$followerId/$followeeId");
  }
}

_updateUserLocation(Position userLocation) async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  String userId = prefs.getString('user_id');
  String long = userLocation.longitude.toString();
  String lat = userLocation.latitude.toString();
  await get("http://66.228.52.222:3000/updateUserLocation/$userId/$long/$lat");
}

class Particles extends StatefulWidget {
  final int numberOfParticles;

  Particles(this.numberOfParticles);

  @override
  _ParticlesState createState() => _ParticlesState();
}

class _ParticlesState extends State<Particles> {
  final Random random = Random();

  final List<ParticleModel> particles = [];

  @override
  void initState() {
    List.generate(widget.numberOfParticles, (index) {
      particles.add(ParticleModel(random));
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Rendering(
      startTime: Duration(seconds: 30),
      onTick: _simulateParticles,
      builder: (context, time) {
        return CustomPaint(
          painter: ParticlePainter(particles, time),
        );
      },
    );
  }

  _simulateParticles(Duration time) {
    particles.forEach((particle) => particle.maintainRestart(time));
  }
}

class ParticleModel {
  Animatable tween;
  double size;
  AnimationProgress animationProgress;
  Random random;

  ParticleModel(this.random) {
    restart();
  }

  restart({Duration time = Duration.zero}) {
    final startPosition = Offset(-0.2 + 1.4 * random.nextDouble(), 1.2);
    final endPosition = Offset(-0.2 + 1.4 * random.nextDouble(), -0.2);
    final duration = Duration(milliseconds: 3000 + random.nextInt(6000));

    tween = MultiTrackTween([
      Track("x").add(
          duration, Tween(begin: startPosition.dx, end: endPosition.dx),
          curve: Curves.easeInOutSine),
      Track("y").add(
          duration, Tween(begin: startPosition.dy, end: endPosition.dy),
          curve: Curves.easeIn),
    ]);
    animationProgress = AnimationProgress(duration: duration, startTime: time);
    size = 0.2 + random.nextDouble() * 0.4;
  }

  maintainRestart(Duration time) {
    if (animationProgress.progress(time) == 1.0) {
      restart(time: time);
    }
  }
}

class ParticlePainter extends CustomPainter {
  List<ParticleModel> particles;
  Duration time;

  ParticlePainter(this.particles, this.time);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white.withAlpha(50);

    particles.forEach((particle) {
      var progress = particle.animationProgress.progress(time);
      final animation = particle.tween.transform(progress);
      final position =
          Offset(animation["x"] * size.width, animation["y"] * size.height);
      canvas.drawCircle(position, size.width * 0.2 * particle.size, paint);
    });
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}

class AnimatedBackground extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final tween = MultiTrackTween([
      Track("color1").add(Duration(seconds: 3),
          ColorTween(begin: Color(0xff8a113a), end: Colors.lightBlue.shade900)),
      Track("color2").add(Duration(seconds: 3),
          ColorTween(begin: Color(0xff440216), end: Colors.blue.shade600))
    ]);

    return ControlledAnimation(
      playback: Playback.MIRROR,
      tween: tween,
      duration: tween.duration,
      builder: (context, animation) {
        return Container(
          decoration: BoxDecoration(
              gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [animation["color1"], animation["color2"]])),
        );
      },
    );
  }
}

class CenteredText extends StatelessWidget {
  const CenteredText({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
        child: InkWell(
            child: Text(
              cnt,
              style:
                  TextStyle(color: Colors.white, fontWeight: FontWeight.w200),
              textScaleFactor: 4,
            ),
            onTap: () {
              _sync();
            }));
  }

  _sync() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String userId = prefs.getString('user_id');
    String followeeName = prefs.getString('followee_name');
    Response res =
        await get("http://66.228.52.222:3000/userName/$followeeName");
    String followeeId = res.body.toString().split(':')[1].split(',')[0];
    String followeeToken = res.body.toString().split(':"')[3].split('"')[0];

    Position userLocation = await Geolocator()
        .getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
    await _updateUserLocation(userLocation);

    res = await get("http://66.228.52.222:3000/chkDis/$userId/$followeeId");
    double distance =
        double.parse(res.body.toString().split(':')[1].split('}')[0]);

    if (distance <= 500) {
      await get("http://66.228.52.222:3000/updateUserCnt/$followeeId");
      await sendAndRetrieveMessage(followeeToken, '有一位關注者在附近! $distance');
    } else {
      await sendAndRetrieveMessage(followeeToken, '有一位關注者離你/妳超遠! $distance');
    }

    res = await get(
        "http://66.228.52.222:3000/userId/${prefs.getString('user_id')}");
    String userCnt = res.body.toString().split(':"')[4].split('"')[0];
    // setState(() {
    //   cnt = userCnt;
    // });
  }
}
