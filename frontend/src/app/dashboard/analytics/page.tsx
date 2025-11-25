'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  PieChartIcon,
  CalendarIcon,
  CheckSquareIcon,
  DollarSignIcon,
  BookOpenIcon,
  ClockIcon,
  TargetIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';

interface AnalyticsData {
  productivity: {
    tasksCompleted: number;
    tasksTotal: number;
    completionRate: number;
    streak: number;
  };
  finance: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthlyTrend: number;
  };
  activity: {
    notesCreated: number;
    eventsScheduled: number;
    listsCreated: number;
    dailyAverage: number;
  };
  timeDistribution: {
    tasks: number;
    notes: number;
    events: number;
    lists: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // Fetch real data from APIs
      const [tasksRes, notesRes, eventsRes, transactionsRes] = await Promise.all([
        apiClient.tasks.getAll(),
        apiClient.notes.getAll(),
        apiClient.events.getAll(),
        apiClient.transactions.getAll(),
      ]);

      const tasks = tasksRes.data.data.tasks || [];
      const notes = notesRes.data.data.notes || [];
      const events = eventsRes.data.data.events || [];
      const transactions = transactionsRes.data.data.transactions || [];

      // Calculate real analytics from user data
      const tasksCompleted = tasks.filter((t: any) => t.status === 'DONE').length;
      const completionRate = tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0;

      const totalIncome = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      const totalExpenses = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      const balance = totalIncome - totalExpenses;

      // Calculate total activities
      const totalActivities = tasks.length + notes.length + events.length;
      const dailyAverage = totalActivities > 0 ? (totalActivities / 30).toFixed(1) : '0';

      // Calculate time distribution percentages
      const taskPercentage = totalActivities > 0 ? Math.round((tasks.length / totalActivities) * 100) : 0;
      const notePercentage = totalActivities > 0 ? Math.round((notes.length / totalActivities) * 100) : 0;
      const eventPercentage = totalActivities > 0 ? Math.round((events.length / totalActivities) * 100) : 0;
      const listPercentage = totalActivities > 0 ? Math.round((0 / totalActivities) * 100) : 0;

      const analyticsData: AnalyticsData = {
        productivity: {
          tasksCompleted,
          tasksTotal: tasks.length,
          completionRate,
          streak: 0 // Will need to be calculated from user data if needed
        },
        finance: {
          totalIncome,
          totalExpenses,
          balance,
          monthlyTrend: 0 // Will need to be calculated from transaction history
        },
        activity: {
          notesCreated: notes.length,
          eventsScheduled: events.length,
          listsCreated: 0, // Will need to fetch from lists API if available
          dailyAverage: parseFloat(dailyAverage as string)
        },
        timeDistribution: {
          tasks: taskPercentage,
          notes: notePercentage,
          events: eventPercentage,
          lists: listPercentage
        }
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set empty data on error instead of mock data
      setData({
        productivity: { tasksCompleted: 0, tasksTotal: 0, completionRate: 0, streak: 0 },
        finance: { totalIncome: 0, totalExpenses: 0, balance: 0, monthlyTrend: 0 },
        activity: { notesCreated: 0, eventsScheduled: 0, listsCreated: 0, dailyAverage: 0 },
        timeDistribution: { tasks: 0, notes: 0, events: 0, lists: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3Icon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Erro ao carregar dados</h3>
        <p className="text-gray-400">Tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Insights sobre sua produtividade e atividades</p>
        </div>
        
        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
          {([
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mês' },
            { value: 'year', label: 'Ano' }
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === value
                  ? 'bg-red-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Taxa de Conclusão</p>
              <p className="text-3xl font-bold text-white mt-1">{data.productivity.completionRate}%</p>
              <p className="text-xs text-gray-400 mt-1">
                {data.productivity.tasksCompleted} de {data.productivity.tasksTotal} tarefas
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TargetIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Saldo Atual</p>
              <p className="text-3xl font-bold text-white mt-1">{formatCurrency(data.finance.balance)}</p>
              <div className="flex items-center mt-1">
                <TrendingUpIcon className="w-3 h-3 text-green-400 mr-1" />
                <span className="text-xs text-green-400">+{data.finance.monthlyTrend}% este mês</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSignIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Sequência Atual</p>
              <p className="text-3xl font-bold text-white mt-1">{data.productivity.streak}</p>
              <p className="text-xs text-gray-400 mt-1">dias consecutivos</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">Média Diária</p>
              <p className="text-3xl font-bold text-white mt-1">{data.activity.dailyAverage}</p>
              <p className="text-xs text-gray-400 mt-1">atividades por dia</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <BarChart3Icon className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <DollarSignIcon className="w-5 h-5 mr-2 text-green-400" />
            Visão Financeira
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center space-x-3">
                <TrendingUpIcon className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Receitas</span>
              </div>
              <span className="text-green-400 font-semibold">{formatCurrency(data.finance.totalIncome)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="flex items-center space-x-3">
                <TrendingDownIcon className="w-5 h-5 text-red-400" />
                <span className="text-white font-medium">Despesas</span>
              </div>
              <span className="text-red-400 font-semibold">{formatCurrency(data.finance.totalExpenses)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center space-x-3">
                <DollarSignIcon className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Balanço</span>
              </div>
              <span className="text-blue-400 font-semibold">{formatCurrency(data.finance.balance)}</span>
            </div>
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2 text-purple-400" />
            Distribuição de Atividades
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Tarefas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.timeDistribution.tasks}%` }}></div>
                </div>
                <span className="text-white text-sm font-medium w-8">{data.timeDistribution.tasks}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-300">Notas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${data.timeDistribution.notes}%` }}></div>
                </div>
                <span className="text-white text-sm font-medium w-8">{data.timeDistribution.notes}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300">Eventos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${data.timeDistribution.events}%` }}></div>
                </div>
                <span className="text-white text-sm font-medium w-8">{data.timeDistribution.events}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Listas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.timeDistribution.lists}%` }}></div>
                </div>
                <span className="text-white text-sm font-medium w-8">{data.timeDistribution.lists}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-6">Resumo de Atividades</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <CheckSquareIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{data.productivity.tasksCompleted}</p>
            <p className="text-gray-400 text-sm">Tarefas Concluídas</p>
          </div>

          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <BookOpenIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{data.activity.notesCreated}</p>
            <p className="text-gray-400 text-sm">Notas Criadas</p>
          </div>

          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <CalendarIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{data.activity.eventsScheduled}</p>
            <p className="text-gray-400 text-sm">Eventos Agendados</p>
          </div>

          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <BarChart3Icon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{data.activity.listsCreated}</p>
            <p className="text-gray-400 text-sm">Listas Criadas</p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUpIcon className="w-5 h-5 mr-2 text-red-400" />
          Insights de Produtividade
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <p className="text-white font-medium mb-2">🎯 Meta Alcançada!</p>
            <p className="text-gray-300 text-sm">
              Você completou {data.productivity.completionRate}% das suas tarefas este mês. 
              Continue assim para manter a alta produtividade!
            </p>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <p className="text-white font-medium mb-2">🔥 Sequência Forte!</p>
            <p className="text-gray-300 text-sm">
              {data.productivity.streak} dias consecutivos de atividade. 
              Você está no caminho certo para formar bons hábitos!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}