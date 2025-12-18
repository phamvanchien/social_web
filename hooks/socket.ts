import { RootState } from '@/reduxs/store.redux';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const userLogged = useSelector((state: RootState) => state.userSlice).data;

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      query: {}
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userLogged]);

  return socket;
}