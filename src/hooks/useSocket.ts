// src/hooks/useSocket.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, PrivateMessage, User, TypingUser } from '../types/chat.types';

interface UseSocketProps {
  token: string | null;
}

export const useSocket = ({ token }: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io('http://localhost:3000/chat', {
      auth: { token },
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socket.on('userOnline', (user: User) => {
      setOnlineUsers(prev => [...prev.filter(u => u.userId !== user.userId), user]);
    });

    socket.on('userOffline', (user: User) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== user.userId));
    });

    socket.on('onlineUsers', (users: User[]) => {
      setOnlineUsers(users);
    });

    socket.on('userTyping', (data: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId || u.roomId !== data.roomId);
        return data.isTyping ? [...filtered, data] : filtered;
      });
    });

    socket.on('userTypingPrivate', (data: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return data.isTyping ? [...filtered, data] : filtered;
      });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const sendMessage = (roomId: number, messageText: string) => {
    socketRef.current?.emit('sendMessage', { roomId, messageText });
  };

  const sendPrivateMessage = (receiverId: number, messageText: string) => {
    socketRef.current?.emit('sendPrivateMessage', { receiverId, messageText });
  };

  const editMessage = (messageId: number, messageText: string) => {
    socketRef.current?.emit('editMessage', { messageId, messageText });
  };

  const deleteMessage = (messageId: number) => {
    socketRef.current?.emit('deleteMessage', { messageId });
  };

  const joinRoom = (roomId: number) => {
    socketRef.current?.emit('joinRoom', { roomId });
  };

  const leaveRoom = (roomId: number) => {
    socketRef.current?.emit('leaveRoom', { roomId });
  };

  const sendTyping = (roomId: number, isTyping: boolean) => {
    socketRef.current?.emit('typing', { roomId, isTyping });
  };

  const sendPrivateTyping = (receiverId: number, isTyping: boolean) => {
    socketRef.current?.emit('typingPrivate', { receiverId, isTyping });
  };

  const getOnlineUsers = () => {
    socketRef.current?.emit('getOnlineUsers');
  };

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendPrivateMessage,
    editMessage,
    deleteMessage,
    joinRoom,
    leaveRoom,
    sendTyping,
    sendPrivateTyping,
    getOnlineUsers,
  };
};