import React from 'react';
import { LogOut, User } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
}

interface DashboardHeaderProps {
  user: User | null;
  onSignOut: () => void;
  glassStyle: string;
  sidebarExpanded: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onSignOut, glassStyle, sidebarExpanded }) => {
  return (
    <div className={`fixed top-0 right-0 left-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-3 py-2 shadow-sm transition-all duration-300 ease-in-out`}
         style={{ marginLeft: sidebarExpanded ? '280px' : '72px' }}>
      <div className="flex justify-between items-center">
        {/* Left side - App title */}
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            IntelCraft
          </h1>
          <span className="text-xs text-gray-500 font-medium">Your smart outreach agent.</span>
        </div>

        {/* Right side - User info and sign out */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* User info */}
              <div className="flex items-center space-x-2">
                {/* Avatar */}
                <div className="relative">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || user.email}
                      className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border border-gray-200 shadow-sm">
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
                  <span className="text-xs font-medium text-gray-900">
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
                className="flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md transition-all duration-200 font-medium text-xs border border-red-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="text-sm text-gray-500">Loading user info...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader; 