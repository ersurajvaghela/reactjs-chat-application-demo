import React, { useState, useEffect } from 'react';
import { ChatRoom, User, Message, PrivateMessage } from '../types/chat.types';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { ChatWindow } from './ChatWindow';

export const ChatApp: React.FC = () => {
  const { token, user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);

  const {
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendPrivateMessage,
    sendTyping,
    sendPrivateTyping,
    joinRoom,
    leaveRoom,
    getOnlineUsers,
    socket,
  } = useSocket({ token });

  useEffect(() => {
    if (socket && isConnected) {
      // Set up message listeners
      socket.on('newMessage', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('newPrivateMessage', (message: PrivateMessage) => {
        setPrivateMessages(prev => [...prev, message]);
      });

      socket.on('messageEdited', (data: { messageId: number; messageText: string; editedAt: Date }) => {
        setMessages(prev => prev.map(msg => 
          msg.messageId === data.messageId 
            ? { ...msg, messageText: data.messageText, editedAt: data.editedAt }
            : msg
        ));
      });

      socket.on('messageDeleted', (data: { messageId: number }) => {
        setMessages(prev => prev.filter(msg => msg.messageId !== data.messageId));
      });

      socket.on('userJoinedRoom', (data: { roomId: number; user: User }) => {
        console.log(`${data.user.username} joined room ${data.roomId}`);
      });

      socket.on('userLeftRoom', (data: { roomId: number; user: User }) => {
        console.log(`${data.user.username} left room ${data.roomId}`);
      });

      // Get online users on connect
      getOnlineUsers();

      return () => {
        socket.off('newMessage');
        socket.off('newPrivateMessage');
        socket.off('messageEdited');
        socket.off('messageDeleted');
        socket.off('userJoinedRoom');
        socket.off('userLeftRoom');
      };
    }
  }, [socket, isConnected, getOnlineUsers]);

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    setSelectedUser(null);
    if (room.roomId) {
      joinRoom(room.roomId);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setSelectedRoom(null);
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleNewPrivateMessage = (message: PrivateMessage) => {
    setPrivateMessages(prev => [...prev, message]);
  };

  return (
    <div className="flex h-screen">
      {/* Connection Status */}
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          Disconnected from server. Trying to reconnect...
        </div>
      )}

      <Sidebar
        selectedRoom={selectedRoom}
        selectedUser={selectedUser}
        onRoomSelect={handleRoomSelect}
        onUserSelect={handleUserSelect}
        onlineUsers={onlineUsers}
        joinRoom={joinRoom}
      />

      <ChatWindow
        selectedRoom={selectedRoom}
        selectedUser={selectedUser}
        sendMessage={sendMessage}
        sendPrivateMessage={sendPrivateMessage}
        sendTyping={sendTyping}
        sendPrivateTyping={sendPrivateTyping}
        messages={messages}
        privateMessages={privateMessages}
        typingUsers={typingUsers}
        onNewMessage={handleNewMessage}
        onNewPrivateMessage={handleNewPrivateMessage}
      />
    </div>
  );
};
