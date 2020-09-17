import { serve } from "https://deno.land/std@0.60.0/http/server.ts";
import { acceptWebSocket, acceptable } from 'https://deno.land/std@0.60.0/ws/mod.ts';
import { chatConnection } from './ws/chatroom.ts';

// server setup
const server = serve({ port: 443 });
console.log("http://localhost:443/");

for await (const req of server) {
  
  // serve index page
  if (req.url === '/') {
    req.respond({
      status: 200,
      body: await Deno.open('./public/index.html')
    });
  }

  // accept the websocket connection
  if (req.url === '/ws') {
    if (acceptable(req)) {
      acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers,
      })
      .then(chatConnection);
    }
  }
  
}