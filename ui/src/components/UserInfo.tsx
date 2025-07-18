import React from 'react';
import { LogOut, User, Plus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
}

interface UserInfoProps {
  user: User | null;
  onSignOut: () => void;
  onNewResearch: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ user, onSignOut, onNewResearch }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-3">
              {user ? (
          <>
            {/* User info and sign out */}
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || user.email}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {user.is_verified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* User details */}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {user.name || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Sign out button */}
              <button
                onClick={onSignOut}
                className="flex items-center space-x-1.5 text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* New Research button */}
            <button
              onClick={onNewResearch}
              className="w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              title="New Research"
            >
              <Plus className="w-5 h-5" />
            </button>
          </>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="text-sm text-gray-500">Loading user info...</div>
        </div>
      )}
    </div>
  );
};

export default UserInfo; 