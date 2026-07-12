import { Server } from 'socket.io';
import { verifyJwt } from '../utils/jwt.js';

let io;

const getCookieValue = (cookieHeader = '', cookieName) => {
  const cookies = cookieHeader.split(';').map((item) => item.trim());
  const found = cookies.find((item) => item.startsWith(`${cookieName}=`));
  if (!found) return null;
  return decodeURIComponent(found.slice(cookieName.length + 1));
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL?.split(',').map((item) => item.trim()) || '*',
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const tokenFromAuth = socket.handshake.auth?.token;
      const tokenFromCookie = getCookieValue(socket.handshake.headers.cookie || '', 'auth_token');
      const token = tokenFromAuth || tokenFromCookie;

      if (token) {
        socket.data.user = verifyJwt(token);
      }

      return next();
    } catch (error) {
      return next(new Error('Unauthorized socket connection'));
    }
  });

  io.on('connection', (socket) => {
    const role = socket.data.user?.role;

    if (role === 'admin' || role === 'manager') {
      socket.join('managers');
    }

    socket.on('disconnect', () => {
      // Intentionally empty. The server only needs room membership while connected.
    });
  });

  return io;
};

export const getIO = () => io;

export const emitToManagers = (eventName, payload) => {
  if (!io) return;
  io.to('managers').emit(eventName, payload);
};
