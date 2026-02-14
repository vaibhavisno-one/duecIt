import { Server } from "socket.io";
import { socketAuth } from "./auth.socket.js";
import { registerMatchHandlers } from "./match.socket.js";

export const initSocket = (httpServer) => {
  console.log("🔥 LOADED socket/index.js – FINAL VERSION");

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN.split(","),
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(
      "🔐 Authenticated socket:",
      socket.user.username
    );

    registerMatchHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(
        "❌ Socket disconnected:",
        socket.user.username
      );
    });
  });

  return io;
};
