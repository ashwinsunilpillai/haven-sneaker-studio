import { io } from "socket.io-client";
import { SOCKET_URL } from "@/lib/config";

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});
