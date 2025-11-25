'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckSquareIcon, 
  CalendarIcon, 
  BookOpenIcon, 
  DollarSignIcon,
  TrendingUpIcon,
  ClockIcon,
  PlusIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

interface DashboardStats {
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  events: {
    today: number;
    upcoming: number;
  };
  notes: {
    total: number;
    recent: number;
  };
  finance: {
    totalExpenses: number;
    totalIncome: number;
    balance: number;
    subscriptions: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'task' | 'event' | 'note' | 'transaction';
  title: string;
  description?: string;
  timestamp: string;
  status?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tasksRes, notesRes, transactionsRes, eventsRes] = await Promise.all([
          apiClient.tasks.getAll(),
          apiClient.notes.getAll(),
          apiClient.transactions.getAll(),
          apiClient.events.getAll(),
        ]);

        const tasks = tasksRes.data.data.tasks || [];
        const notes = notesRes.data.data.notes || [];
        const transactions = transactionsRes.data.data.transactions || [];
        const events = eventsRes.data.data.events || [];

        // Calculate real stats from actual user data
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const completedTasks = tasks.filter((t: any) => t.status === 'DONE').length;
        const pendingTasks = tasks.filter((t: any) => t.status !== 'DONE').length;
        const overdueTasks = tasks.filter((t: any) => {
          if (!t.dueDate || t.status === 'DONE') return false;
          return new Date(t.dueDate) < today;
        }).length;

        const todayEvents = events.filter((e: any) => {
          const eventDate = new Date(e.date);
          return eventDate.getDate() === today.getDate() &&
                 eventDate.getMonth() === today.getMonth() &&
                 eventDate.getFullYear() === today.getFullYear();
        }).length;

        const totalIncome = transactions
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        const totalExpenses = transactions
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        const stats: DashboardStats = {
          tasks: {
            total: tasks.length,
            completed: completedTasks,
            pending: pendingTasks,
            overdue: overdueTasks,
          },
          events: {
            today: todayEvents,
            upcoming: events.length - todayEvents,
          },
          notes: {
            total: notes.length,
            recent: Math.min(notes.length, 5),
          },
          finance: {
            totalExpenses,
            totalIncome,
            balance: totalIncome - totalExpenses,
            subscriptions: 0, // Will be calculated if subscriptions API is available
          },
        };

        setStats(stats);

        // Convert API responses to recent activity
        const activities: RecentActivity[] = [
          ...tasks.slice(0, 3).map((task: any) => ({
            id: task.id,
            type: 'task' as const,
            title: task.title,
            description: task.description,
            timestamp: task.updatedAt || task.createdAt,
            status: task.status,
          })),
          ...notes.slice(0, 3).map((note: any) => ({
            id: note.id,
            type: 'note' as const,
            title: note.title,
            description: note.content?.substring(0, 100),
            timestamp: note.updatedAt || note.createdAt,
          })),
          ...transactions.slice(0, 2).map((transaction: any) => ({
            id: transaction.id,
            type: 'transaction' as const,
            title: transaction.title,
            description: `${formatCurrency(transaction.amount)} - ${transaction.category}`,
            timestamp: transaction.createdAt,
          })),
        ];

        // Sort by timestamp and take the most recent
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivity(activities.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set empty stats on error
        setStats({
          tasks: { total: 0, completed: 0, pending: 0, overdue: 0 },
          events: { today: 0, upcoming: 0 },
          notes: { total: 0, recent: 0 },
          finance: { totalExpenses: 0, totalIncome: 0, balance: 0, subscriptions: 0 },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta!</h1>
        <p className="text-red-100">Aqui está um resumo da sua produtividade hoje.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tasks Stats */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tarefas</p>
              <p className="text-2xl font-bold text-white">{stats.tasks.pending}</p>
              <p className="text-xs text-gray-500">de {stats.tasks.total} tarefas</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <CheckSquareIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs">
            <span className="text-green-400">✓ {stats.tasks.completed} concluídas</span>
            <span className="text-red-400">⚠ {stats.tasks.overdue} atrasadas</span>
          </div>
        </div>

        {/* Events Stats */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Eventos Hoje</p>
              <p className="text-2xl font-bold text-white">{stats.events.today}</p>
              <p className="text-xs text-gray-500">{stats.events.upcoming} próximos</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Notes Stats */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Notas</p>
              <p className="text-2xl font-bold text-white">{stats.notes.total}</p>
              <p className="text-xs text-gray-500">{stats.notes.recent} recentes</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Finance Stats */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Saldo</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.finance.balance)}</p>
              <p className="text-xs text-gray-500">{stats.finance.subscriptions} assinaturas</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSignIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/tasks?create=true"
            className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 text-blue-400" />
            <span className="text-white text-sm">Nova Tarefa</span>
          </Link>
          <Link
            href="/dashboard/notes?create=true"
            className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-white text-sm">Nova Nota</span>
          </Link>
          <Link
            href="/dashboard/calendar?create=true"
            className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 text-purple-400" />
            <span className="text-white text-sm">Novo Evento</span>
          </Link>
          <Link
            href="/dashboard/finance?create=true"
            className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 text-green-400" />
            <span className="text-white text-sm">Nova Transação</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Atividade Recente</h2>
          <ClockIcon className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className="flex-shrink-0">
                {activity.type === 'task' && <CheckSquareIcon className="w-4 h-4 text-blue-400" />}
                {activity.type === 'note' && <BookOpenIcon className="w-4 h-4 text-yellow-400" />}
                {activity.type === 'event' && <CalendarIcon className="w-4 h-4 text-purple-400" />}
                {activity.type === 'transaction' && <DollarSignIcon className="w-4 h-4 text-green-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{activity.title}</p>
                {activity.description && (
                  <p className="text-gray-400 text-xs truncate">{activity.description}</p>
                )}
                <p className="text-gray-500 text-xs">{formatRelativeTime(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}