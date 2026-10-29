import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const rawApiUrl =
      (import.meta.env.VITE_API_URL as string | undefined) ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000");
    const serverUrl =
      (import.meta.env.VITE_SOCKET_URL as string | undefined) ||
      rawApiUrl.replace(/\/api\/?$/, "");

    socket = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
