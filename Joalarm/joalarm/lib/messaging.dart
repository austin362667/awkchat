import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

FirebaseMessaging configureMessaging() {
  FirebaseMessaging firebaseMessaging = FirebaseMessaging();

  // only fire on iOS
  firebaseMessaging.requestNotificationPermissions(
      const IosNotificationSettings(sound: true, badge: true, alert: true));
  firebaseMessaging.onIosSettingsRegistered
      .listen((IosNotificationSettings settings) {
    print("Settings registered: ${settings}");
  });

  firebaseMessaging.configure(onMessage: (Map<String, dynamic> message) async {
    print('on Message: ${message}');
  }, onLaunch: (Map<String, dynamic> message) async {
    print('on Launch:');
  }, onResume: (Map<String, dynamic> message) async {
    print('on Resume:');
  });
  return firebaseMessaging;
}

// Replace with server token from firebase console settings.
final String serverToken =
    'AAAA4ozA9jE:APA91bEvb8Fj7rvSycDTtz60Qv-OMEU0i1O59RDxNo7qanLuZhhT6jjnppMufkxWL3bq6PkUaFAB5mcOdBYHfd-cxjL_U9LiYpzNqChxzH5EEnievjjdQS-nzRiMxmbzn3WMlcRPSRul';
final FirebaseMessaging firebaseMessaging = FirebaseMessaging();

Future<Map<String, dynamic>> sendAndRetrieveMessage(
    String taToken, String body) async {
  await firebaseMessaging.requestNotificationPermissions(
    const IosNotificationSettings(
        sound: true, badge: true, alert: true, provisional: false),
  );

  await post(
    'https://fcm.googleapis.com/fcm/send',
    headers: <String, String>{
      'Content-Type': 'application/json',
      'Authorization': 'key=$serverToken',
    },
    body: jsonEncode(
      <String, dynamic>{
        'notification': <String, dynamic>{'body': body, 'title': '[通知]戀愛鈴'},
        'priority': 'high',
        'data': <String, dynamic>{
          'click_action': 'FLUTTER_NOTIFICATION_CLICK',
          'id': '1',
          'status': 'done'
        },
        'to': taToken,
      },
    ),
  );

  final Completer<Map<String, dynamic>> completer =
      Completer<Map<String, dynamic>>();

  firebaseMessaging.configure(
    onMessage: (Map<String, dynamic> message) async {
      completer.complete(message);
    },
  );

  return completer.future;
}
