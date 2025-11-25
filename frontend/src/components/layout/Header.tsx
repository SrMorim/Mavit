'use client';

import React from 'react';
import { MenuIcon, SearchIcon, BellIcon } from 'lucide-react';
import { useAuth } from '@/lib/providers/AuthProvider';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-400 hover:text-white transition-colors"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-64"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <BellIcon className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  );
};