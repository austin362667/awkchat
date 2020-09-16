import {
  WebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.60.0/ws/mod.ts";
import { v4 } from "https://deno.land/std@0.60.0/uuid/mod.ts";
// import { camelize } from "./camelize.ts";

const users = new Map<string, WebSocket>();

function broadcast(message: string, senderId?: string): void {
  if (!message) return;
  for (const user of users.values()) {
    user.send(senderId ? `[${senderId}]: ${message}` : message);
  }
}

export async function chat(ws: WebSocket): Promise<void> {
  const userId = v4.generate();

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
