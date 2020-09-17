import {
  WebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.60.0/ws/mod.ts";
import { v4 } from "https://deno.land/std@0.60.0/uuid/mod.ts";
import { generate } from "https://deno.land/std@0.60.0/uuid/v1.ts";
// import { camelize } from "./camelize.ts";

const users = new Map<string, WebSocket>();

function broadcast(message: string, senderId?: string): void {
  if (!message) return;
  for (const user of users.values()) {
    user.send(senderId ? `[${senderId}]: ${message}` : message);
  }
}

function getRandomInt(max:number) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generateName() {
  const adj = ['藍色', '藍', '紅', '黃', '綠色', '綠', '紫色', '黑白', '黯綠', '褐', '金黃','美麗','漂亮','開開心心','怒','尷尬','時間管理','努力的','亭亭玉立','忿忿不平','嘻嘻哈哈','淺藍','閃亮','暗', '好奇', '帥氣']
  const n = ['寶寶','獨角獸','大師','打工仔','老司機','美少女','葛格','恐龍化石','小可愛','小姐姐','大學生','蟑螂','小男孩', '大美女', '北鼻','教授','帥哥','饒舌歌手','湯姆貓','米奇老鼠','小飛象','小公主','美人魚','花木蘭'] 
  return adj[getRandomInt(adj.length)] + adj[getRandomInt(adj.length)] + n[getRandomInt(n.length)];
}

export async function chat(ws: WebSocket): Promise<void> {
  const userId = generateName();//v4.generate();

  // Register user connection
  users.set(userId, ws);
  broadcast(`> 用戶 ${userId} 進來了！`);

  // Wait for new messages
  for await (const event of ws) {
    const message = typeof event === "string" ? event : "";

    broadcast(message, userId);

    // Unregister user conection
    if (!message && isWebSocketCloseEvent(event)) {
      users.delete(userId);
      broadcast(`> 用戶 ${userId} 離開了..`);
      break;
    }
  }
}
