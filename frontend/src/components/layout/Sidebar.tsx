'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CheckSquareIcon, 
  CalendarIcon, 
  BookOpenIcon, 
  ListTodoIcon, 
  DollarSignIcon, 
  BarChart3Icon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
  XIcon
} from 'lucide-react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { MavitLogo } from '@/components/ui/MavitLogo';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Tarefas', href: '/dashboard/tasks', icon: CheckSquareIcon },
  { name: 'Calendário', href: '/dashboard/calendar', icon: CalendarIcon },
  { name: 'Notas', href: '/dashboard/notes', icon: BookOpenIcon },
  { name: 'Listas', href: '/dashboard/lists', icon: ListTodoIcon },
  { name: 'Finanças', href: '/dashboard/finance', icon: DollarSignIcon },
  { name: 'Análises', href: '/dashboard/analytics', icon: BarChart3Icon },
  { name: 'Configurações', href: '/dashboard/settings', icon: SettingsIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <MavitLogo size="md" showText={true} textSize="md" />
          
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-red-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                )}
                onClick={() => {
                  // Close mobile sidebar when navigating
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOutIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            Sair
          </button>
        </div>
      </div>
    </>
  );
};