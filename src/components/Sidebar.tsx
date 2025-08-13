import React, { useState, useEffect } from 'react';
import { ChatRoom, User } from '../types/chat.types';
import { chatService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  selectedRoom: ChatRoom | null;
  selectedUser: User | null;
  onRoomSelect: (room: ChatRoom) => void;
  onUserSelect: (user: User) => void;
  onlineUsers: User[];
  joinRoom: (roomId: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedRoom,
  selectedUser,
  onRoomSelect,
  onUserSelect,
  onlineUsers,
  joinRoom,
}) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'users'>('rooms');
  const { user, logout } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRooms, users] = await Promise.all([
        chatService.getUserRooms(),
        chatService.getUsers(),
      ]);
      setRooms(userRooms);
      setAllUsers(users.filter(u => u.userId !== user?.userId));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const newRoom = await chatService.createRoom(newRoomName);
      setRooms(prev => [...prev, newRoom]);
      setNewRoomName('');
      setShowCreateRoom(false);
      joinRoom(newRoom.roomId);
      onRoomSelect(newRoom);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Chat App</h1>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>
        <p className="text-sm text-gray-400">{user?.username}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-2 px-4 text-sm ${
            activeTab === 'rooms' ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
          onClick={() => setActiveTab('rooms')}
        >
          Rooms
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm ${
            activeTab === 'users' ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'rooms' ? (
          <div>
            {/* Create Room */}
            <div className="p-4 border-b border-gray-700">
              {showCreateRoom ? (
                <form onSubmit={handleCreateRoom} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full px-3 py-1 bg-gray-700 text-white rounded focus:outline-none focus:bg-gray-600"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateRoom(false)}
                      className="flex-1 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  + Create Room
                </button>
              )}
            </div>

            {/* Rooms List */}
            <div>
              {rooms.map((room) => (
                <div
                  key={room.roomId}
                  className={`p-3 cursor-pointer hover:bg-gray-700 ${
                    selectedRoom?.roomId === room.roomId ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => onRoomSelect(room)}
                >
                  <div className="font-medium">{room.roomName}</div>
                  <div className="text-xs text-gray-400">
                    Created by {room.createdBy.username}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Online Users */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Online ({onlineUsers.length})
              </h3>
              {onlineUsers.map((onlineUser) => (
                <div
                  key={`online-${onlineUser.userId}`}
                  className={`p-2 cursor-pointer hover:bg-gray-700 rounded ${
                    selectedUser?.userId === onlineUser.userId ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => onUserSelect(onlineUser)}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>{onlineUser.username}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* All Users */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">All Users</h3>
              {allUsers.map((allUser) => (
                <div
                  key={`all-${allUser.userId}`}
                  className={`p-2 cursor-pointer hover:bg-gray-700 rounded ${
                    selectedUser?.userId === allUser.userId ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => onUserSelect(allUser)}
                >
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      onlineUsers.some(u => u.userId === allUser.userId) 
                        ? 'bg-green-500' 
                        : 'bg-gray-500'
                    }`}></div>
                    <span>{allUser.username}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};