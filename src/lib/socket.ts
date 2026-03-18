// ============================================================
// Socket.IO Client Singleton
// Connects to the real-time server. Will be integrated with
// backend Socket.IO server once APIs are provided.
// ============================================================

import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let socket: Socket | null = null;

/**
 * getSocket — returns a singleton Socket.IO instance.
 * Safe to call multiple times; only one connection is created.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("[Socket.IO] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket.IO] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket.IO] Connection error:", err.message);
    });
  }

  return socket;
}

/**
 * disconnectSocket — cleanly disconnects and clears the singleton.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
