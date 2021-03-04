import 'package:dio/dio.dart';

String createUserRes = "";
BaseOptions options = new BaseOptions(
  baseUrl: "http://66.228.52.222:3000",
  connectTimeout: 10000,
  receiveTimeout: 3000,
);

Future<int> createUser() async {
  Response response;
  Dio dio = new Dio(options);
  String name = "Austin";
  String long = '121';
  String lat = '24';
  response = await dio.get("/createUser/cccc/121.5/24.5"); //$name/$long/$lat
  print(response.data.toString());
  return response.statusCode;
}

main() async {
  await createUser();
}
