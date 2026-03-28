import jwt from 'jsonwebtoken';
import { env } from '../utils/envConfig.js';
import {
  joinUploadRoom,
  markUploadCancelled,
  setUploadSocketServer,
} from './uploadSocketManager.js';

const readToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (typeof authToken === 'string' && authToken.length > 0) {
    return authToken;
  }

  const headerAuth = socket.handshake?.headers?.authorization;
  if (typeof headerAuth === 'string' && headerAuth.startsWith('Bearer ')) {
    return headerAuth.slice(7);
  }

  return null;
};

const attachUploadSocketHandlers = (socket) => {
  socket.on('upload:subscribe', ({ uploadId } = {}) => {
    if (!uploadId) return;
    joinUploadRoom(socket, uploadId);
  });

  socket.on('upload:cancel', ({ uploadId } = {}) => {
    if (!uploadId) return;
    markUploadCancelled(uploadId);
  });
};

export const initializeUploadSocketServer = (io) => {
  setUploadSocketServer(io);

  io.use((socket, next) => {
    try {
      const token = readToken(socket);
      if (!token) {
        return next(new Error('Missing socket auth token'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      return next();
    } catch (error) {
      return next(new Error('Invalid socket token'));
    }
  });

  io.on('connection', (socket) => {
    attachUploadSocketHandlers(socket);
  });

  console.log('✅ Upload Socket.IO server ready');
};
