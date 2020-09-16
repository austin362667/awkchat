import { listenAndServe } from "https://deno.land/std@0.60.0/http/server.ts";
import { acceptWebSocket, acceptable } from "https://deno.land/std@0.60.0/ws/mod.ts";
import { chat } from "./chat.ts";

const option = {
  secure: true,
  port: 443,
  // port: 80,
  certFile: "/etc/letsencrypt/live/lattemall.company/fullchain.pem",
  keyFile: "/etc/letsencrypt/live/lattemall.company/privkey.pem",
}

listenAndServe(option, async (req) => {
  if (req.method === "GET" && req.url === "/") {
    req.respond({
      status: 200,
      headers: new Headers({
        "content-type": "text/html",
      }),
      body: await Deno.open("./index.html"),
    });
  }

  // WebSockets Chat
  if (req.method === "GET" && req.url === "/ws") {
    if (acceptable(req)) {
      acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers,
      }).then(chat);
    }
  }
});

console.log("Server running on localhost:443");
