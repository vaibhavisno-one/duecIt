import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const socketAuth = async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;

    if (!token) {
      const authHeader = socket.handshake.headers?.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "");
      }
    }

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded._id)
      .select("-password -refreshToken");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
};
