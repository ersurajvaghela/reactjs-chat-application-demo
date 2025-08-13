// src/components/ChatWindow.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Message, PrivateMessage, ChatRoom, User, TypingUser } from '../types/chat.types';
import { chatService } from '../services/api.service';
import { MessageInput } from './MessageInput';
import { useAuth } from '../context/AuthContext';

interface ChatWindowProps {
  selectedRoom: ChatRoom | null;
  selectedUser: User | null;
  sendMessage: (roomId: number, message: string) => void;
  sendPrivateMessage: (receiverId: number, message: string) => void;
  sendTyping: (roomId: number, isTyping: boolean) => void;
  sendPrivateTyping: (receiverId: number, isTyping: boolean) => void;
  messages: Message[];
  privateMessages: PrivateMessage[];
  typingUsers: TypingUser[];
  onNewMessage: (message: Message) => void;
  onNewPrivateMessage: (message: PrivateMessage) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedRoom,
  selectedUser,
  sendMessage,
  sendPrivateMessage,
  sendTyping,
  sendPrivateTyping,
  messages,
  privateMessages,
  typingUsers,
  onNewMessage,
  onNewPrivateMessage,
}) => {
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);
  const [userMessages, setUserMessages] = useState<PrivateMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages, userMessages]);

  useEffect(() => {
    if (selectedRoom) {
      loadRoomMessages(selectedRoom.roomId);
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedUser) {
      loadUserMessages(selectedUser.userId);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedRoom) {
      const newRoomMessages = messages.filter(m => m.roomId === selectedRoom.roomId);
      setRoomMessages(prev => {
        const existingIds = new Set(prev.map(m => m.messageId));
        const uniqueNew = newRoomMessages.filter(m => !existingIds.has(m.messageId));
        return [...prev, ...uniqueNew];
      });
    }
  }, [messages, selectedRoom]);

  useEffect(() => {
    if (selectedUser) {
      const newUserMessages = privateMessages.filter(
        m => m.senderId === selectedUser.userId || m.receiverId === selectedUser.userId
      );
      setUserMessages(prev => {
        const existingIds = new Set(prev.map(m => m.messageId));
        const uniqueNew = newUserMessages.filter(m => !existingIds.has(m.messageId));
        return [...prev, ...uniqueNew];
      });
    }
  }, [privateMessages, selectedUser]);

  const loadRoomMessages = async (roomId: number) => {
    try {
      const messages = await chatService.getRoomMessages(roomId);
      setRoomMessages(messages);
    } catch (error) {
      console.error('Failed to load room messages:', error);
    }
  };

  const loadUserMessages = async (userId: number) => {
    try {
      const messages = await chatService.getConversationWithUser(userId);
      setUserMessages(messages);
    } catch (error) {
      console.error('Failed to load user messages:', error);
    }
  };

  const handleSendMessage = (message: string) => {
    if (selectedRoom) {
      sendMessage(selectedRoom.roomId, message);
    } else if (selectedUser) {
      sendPrivateMessage(selectedUser.userId, message);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (selectedRoom) {
      sendTyping(selectedRoom.roomId, isTyping);
    } else if (selectedUser) {
      sendPrivateTyping(selectedUser.userId, isTyping);
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTypingText = () => {
    const relevantTyping = selectedRoom
      ? typingUsers.filter(t => t.roomId === selectedRoom.roomId)
      : typingUsers.filter(t => !t.roomId); // Private typing doesn't have roomId

    if (relevantTyping.length === 0) return null;
    
    const names = relevantTyping.map(t => t.username);
    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    } else {
      return `${names.length} people are typing...`;
    }
  };

  if (!selectedRoom && !selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <h2 className="text-xl font-medium mb-2">Welcome to Chat App</h2>
          <p>Select a room or user to start chatting</p>
        </div>
      </div>
    );
  }

  const currentMessages = selectedRoom ? roomMessages : userMessages;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold">
          {selectedRoom ? `# ${selectedRoom.roomName}` : `@ ${selectedUser?.username}`}
        </h2>
        {selectedRoom && (
          <p className="text-sm text-gray-500">
            Created by {selectedRoom?.createdBy?.username}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {currentMessages.map((message) => {
          const isOwnMessage = selectedRoom 
            ? (message as Message).sender.userId === user?.userId
            : (message as PrivateMessage).senderId === user?.userId;

          return (
            <div
              key={message.messageId}
              className={`mb-4 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                {!isOwnMessage && (
                  <div className="text-xs font-medium mb-1">
                    {selectedRoom 
                      ? (message as Message).sender.username
                      : (message as PrivateMessage).sender.username
                    }
                  </div>
                )}
                <div className="text-sm">{message.messageText}</div>
                <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                  {formatTime(message.sentAt)}
                  {selectedRoom && (message as Message).editedAt && (
                    <span className="ml-1">(edited)</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {getTypingText() && (
          <div className="mb-4 flex justify-start">
            <div className="bg-gray-200 px-4 py-2 rounded-lg">
              <div className="text-sm text-gray-600">{getTypingText()}</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        placeholder={
          selectedRoom 
            ? `Message #${selectedRoom.roomName}`
            : `Message @${selectedUser?.username}`
        }
      />
    </div>
  );
};
