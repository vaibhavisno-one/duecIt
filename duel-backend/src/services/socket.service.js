import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN.split(',').map(o => o.trim()),
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded._id).select('-password -refreshToken');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      socket.rating = user.rating;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.username} (${socket.userId})`);

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.username}`);
      emitToUser(socket.userId, 'user:disconnected');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  const sockets = Array.from(io.sockets.sockets.values());
  const userSocket = sockets.find(s => s.userId === userId.toString());
  
  if (userSocket) {
    userSocket.emit(event, data);
  }
};

export const emitToMatch = (matchId, event, data) => {
  io.to(matchId).emit(event, data);
};

export const joinMatchRoom = (userId, matchId) => {
  const sockets = Array.from(io.sockets.sockets.values());
  const userSocket = sockets.find(s => s.userId === userId.toString());
  
  if (userSocket) {
    userSocket.join(matchId);
  }
};

export const leaveMatchRoom = (userId, matchId) => {
  const sockets = Array.from(io.sockets.sockets.values());
  const userSocket = sockets.find(s => s.userId === userId.toString());
  
  if (userSocket) {
    userSocket.leave(matchId);
  }
};