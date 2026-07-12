import { io } from 'socket.io-client';

export const createSocket = () => {
  return io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    withCredentials: true,
    autoConnect: false
  });
};
