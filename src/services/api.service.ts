// src/services/api.service.ts
import axios from 'axios';
import { User, ChatRoom, Message, PrivateMessage } from '../types/chat.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
};

export const chatService = {
  getRooms: async (): Promise<ChatRoom[]> => {
    const response = await api.get('/chat-rooms');
    return response.data;
  },
  
  getUserRooms: async (): Promise<ChatRoom[]> => {
    const response = await api.get('/chat-rooms/my-rooms');
    return response.data;
  },
  
  createRoom: async (roomName: string): Promise<ChatRoom> => {
    const response = await api.post('/chat-rooms', { roomName });
    return response.data;
  },
  
  getRoomMessages: async (roomId: number): Promise<Message[]> => {
    const response = await api.get(`/messages/room/${roomId}`);
    return response.data;
  },
  
  getPrivateConversations: async (): Promise<PrivateMessage[]> => {
    const response = await api.get('/private-messages/conversations');
    return response.data;
  },
  
  getConversationWithUser: async (userId: number): Promise<PrivateMessage[]> => {
    const response = await api.get(`/private-messages/conversation/${userId}`);
    return response.data;
  },
  
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
};