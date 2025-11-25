/**
 * Analytics Controller
 * Provides comprehensive insights and analytics across all modules
 */

import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { catchAsync } from '../middleware/errorHandler';

class AnalyticsController {
  // Get comprehensive financial analytics
  getFinancialAnalytics = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { period = '30d' } = req.query;

    const dateFilter = this.getDateFilter(period as string);

    const analytics = await prisma.$transaction(async (tx) => {
      // Financial overview
      const [incomeTotal, expenseTotal, transactionCount] = await Promise.all([
        tx.transaction.aggregate({
          where: { userId, type: 'INCOME', date: dateFilter },
          _sum: { amount: true },
        }),
        tx.transaction.aggregate({
          where: { userId, type: 'EXPENSE', date: dateFilter },
          _sum: { amount: true },
        }),
        tx.transaction.count({
          where: { userId, date: dateFilter },
        }),
      ]);

      // Category breakdown
      const categoryBreakdown = await tx.transaction.groupBy({
        by: ['category', 'type'],
        where: { userId, date: dateFilter },
        _sum: { amount: true },
        _count: { category: true },
      });

      // Monthly trends (last 12 months)
      const monthlyTrends = await tx.$queryRaw<Array<{
        year: number;
        month: number;
        income: number;
        expense: number;
        transactions: number;
      }>>`
        SELECT 
          EXTRACT(YEAR FROM date) as year,
          EXTRACT(MONTH FROM date) as month,
          COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense,
          COUNT(*) as transactions
        FROM "transactions"
        WHERE "user_id" = ${userId}
          AND date >= NOW() - INTERVAL '12 months'
        GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
        ORDER BY year, month
      `;

      // Subscription analytics
      const [activeSubscriptions, subscriptionTotal] = await Promise.all([
        tx.subscription.count({ where: { userId, isActive: true } }),
        tx.subscription.aggregate({
          where: { userId, isActive: true },
          _sum: { amount: true },
        }),
      ]);

      // Calculate monthly subscription equivalent
      const subscriptionBreakdown = await tx.subscription.groupBy({
        by: ['billingCycle'],
        where: { userId, isActive: true },
        _sum: { amount: true },
      });

      let monthlySubscriptionTotal = 0;
      subscriptionBreakdown.forEach(sub => {
        const amount = Number(sub._sum.amount || 0);
        switch (sub.billingCycle) {
          case 'WEEKLY':
            monthlySubscriptionTotal += amount * 4.33;
            break;
          case 'MONTHLY':
            monthlySubscriptionTotal += amount;
            break;
          case 'QUARTERLY':
            monthlySubscriptionTotal += amount / 3;
            break;
          case 'YEARLY':
            monthlySubscriptionTotal += amount / 12;
            break;
        }
      });

      // Financial health score (0-100)
      const totalIncome = Number(incomeTotal._sum.amount || 0);
      const totalExpense = Number(expenseTotal._sum.amount || 0);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
      const healthScore = Math.max(0, Math.min(100, 50 + savingsRate));

      // Top spending categories
      const topCategories = categoryBreakdown
        .filter(cat => cat.type === 'EXPENSE')
        .sort((a, b) => Number(b._sum.amount) - Number(a._sum.amount))
        .slice(0, 5)
        .map(cat => ({
          category: cat.category,
          amount: Number(cat._sum.amount),
          count: cat._count.category,
          percentage: totalExpense > 0 ? (Number(cat._sum.amount) / totalExpense) * 100 : 0,
        }));

      return {
        overview: {
          totalIncome,
          totalExpense,
          netIncome: totalIncome - totalExpense,
          transactionCount,
          averageTransaction: transactionCount > 0 ? (totalIncome + totalExpense) / transactionCount : 0,
          savingsRate: Math.round(savingsRate * 100) / 100,
          healthScore: Math.round(healthScore),
        },
        subscriptions: {
          activeCount: activeSubscriptions,
          monthlyTotal: Number(subscriptionTotal._sum.amount || 0),
          monthlyEquivalent: Math.round(monthlySubscriptionTotal * 100) / 100,
          yearlyProjection: Math.round(monthlySubscriptionTotal * 12 * 100) / 100,
        },
        trends: monthlyTrends.map(trend => ({
          year: Number(trend.year),
          month: Number(trend.month),
          income: Number(trend.income),
          expense: Number(trend.expense),
          net: Number(trend.income) - Number(trend.expense),
          transactions: Number(trend.transactions),
        })),
        categories: {
          topSpending: topCategories,
          breakdown: categoryBreakdown.map(cat => ({
            category: cat.category,
            type: cat.type,
            amount: Number(cat._sum.amount),
            count: cat._count.category,
          })),
        },
        insights: this.generateFinancialInsights({
          savingsRate,
          topCategory: topCategories[0]?.category,
          subscriptionTotal: monthlySubscriptionTotal,
          expenseGrowth: this.calculateGrowthRate(monthlyTrends.map(t => Number(t.expense))),
        }),
      };
    });

    res.status(200).json({
      status: 'success',
      data: { analytics },
    });
  });

  // Get productivity analytics
  getProductivityAnalytics = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { period = '30d' } = req.query;

    const dateFilter = this.getDateFilter(period as string);

    const analytics = await prisma.$transaction(async (tx) => {
      // Task analytics
      const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
        tx.task.count({ where: { userId, createdAt: dateFilter } }),
        tx.task.count({ 
          where: { 
            userId, 
            status: 'DONE',
            completedAt: dateFilter 
          } 
        }),
        tx.task.count({
          where: {
            userId,
            status: { not: 'DONE' },
            dueDate: { lt: new Date(), ...dateFilter },
          },
        }),
      ]);

      // Task completion trend
      const taskTrends = await tx.$queryRaw<Array<{
        date: Date;
        created: number;
        completed: number;
      }>>`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as created,
          SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as completed
        FROM "tasks"
        WHERE "user_id" = ${userId}
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      // Task distribution by priority and status
      const taskDistribution = await tx.task.groupBy({
        by: ['priority', 'status'],
        where: { userId },
        _count: { priority: true },
      });

      // Events analytics
      const [totalEvents, upcomingEvents] = await Promise.all([
        tx.event.count({ where: { userId, createdAt: dateFilter } }),
        tx.event.count({
          where: {
            userId,
            startDate: { gte: new Date() },
          },
        }),
      ]);

      // Notes analytics
      const [totalNotes, archivedNotes] = await Promise.all([
        tx.note.count({ where: { userId, createdAt: dateFilter } }),
        tx.note.count({ where: { userId, isArchived: true } }),
      ]);

      // Lists analytics
      const [totalLists, totalListItems, completedListItems] = await Promise.all([
        tx.list.count({ where: { userId, createdAt: dateFilter } }),
        tx.listItem.count({
          where: {
            list: { userId },
            createdAt: dateFilter,
          },
        }),
        tx.listItem.count({
          where: {
            list: { userId },
            isCompleted: true,
            completedAt: dateFilter,
          },
        }),
      ]);

      // Productivity score (0-100)
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
      const productivityScore = Math.max(0, Math.min(100, completionRate - overdueRate));

      return {
        overview: {
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate: Math.round(completionRate * 100) / 100,
          productivityScore: Math.round(productivityScore),
        },
        modules: {
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            overdue: overdueTasks,
            distribution: taskDistribution.map(dist => ({
              priority: dist.priority,
              status: dist.status,
              count: dist._count.priority,
            })),
          },
          events: {
            total: totalEvents,
            upcoming: upcomingEvents,
          },
          notes: {
            total: totalNotes,
            archived: archivedNotes,
            active: totalNotes - archivedNotes,
          },
          lists: {
            total: totalLists,
            items: totalListItems,
            completed: completedListItems,
            completionRate: totalListItems > 0 ? (completedListItems / totalListItems) * 100 : 0,
          },
        },
        trends: taskTrends.map(trend => ({
          date: trend.date,
          created: Number(trend.created),
          completed: Number(trend.completed),
          efficiency: Number(trend.created) > 0 ? (Number(trend.completed) / Number(trend.created)) * 100 : 0,
        })),
        insights: this.generateProductivityInsights({
          completionRate,
          overdueRate,
          totalTasks,
          period: period as string,
        }),
      };
    });

    res.status(200).json({
      status: 'success',
      data: { analytics },
    });
  });

  // Get dashboard overview
  getDashboardAnalytics = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const dashboard = await prisma.$transaction(async (tx) => {
      // Quick stats
      const [
        pendingTasks,
        todayEvents,
        activeSubscriptions,
        weeklyExpenses,
        monthlyExpenses,
        totalNotes,
        totalLists,
      ] = await Promise.all([
        tx.task.count({
          where: { userId, status: { in: ['TODO', 'IN_PROGRESS'] } },
        }),
        tx.event.count({
          where: {
            userId,
            startDate: {
              gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
              lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
            },
          },
        }),
        tx.subscription.count({ where: { userId, isActive: true } }),
        tx.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            date: { gte: thisWeek },
          },
          _sum: { amount: true },
        }),
        tx.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            date: { gte: thisMonth },
          },
          _sum: { amount: true },
        }),
        tx.note.count({ where: { userId, isArchived: false } }),
        tx.list.count({ where: { userId, isArchived: false } }),
      ]);

      // Upcoming tasks and events
      const upcomingTasks = await tx.task.findMany({
        where: {
          userId,
          status: { not: 'DONE' },
          dueDate: {
            gte: today,
            lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          title: true,
          priority: true,
          dueDate: true,
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      });

      const upcomingEvents = await tx.event.findMany({
        where: {
          userId,
          startDate: {
            gte: today,
            lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
        },
        orderBy: { startDate: 'asc' },
        take: 5,
      });

      // Subscription alerts (billing within 7 days)
      const upcomingBillings = await tx.subscription.findMany({
        where: {
          userId,
          isActive: true,
          nextBilling: {
            gte: today,
            lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          name: true,
          amount: true,
          nextBilling: true,
        },
        orderBy: { nextBilling: 'asc' },
        take: 5,
      });

      return {
        quickStats: {
          pendingTasks,
          todayEvents,
          activeSubscriptions,
          totalNotes,
          totalLists,
          weeklySpending: Number(weeklyExpenses._sum.amount || 0),
          monthlySpending: Number(monthlyExpenses._sum.amount || 0),
        },
        upcoming: {
          tasks: upcomingTasks,
          events: upcomingEvents,
          billings: upcomingBillings.map(sub => ({
            ...sub,
            daysUntil: Math.ceil(
              (sub.nextBilling!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            ),
          })),
        },
        alerts: {
          overdueTasks: await tx.task.count({
            where: {
              userId,
              status: { not: 'DONE' },
              dueDate: { lt: today },
            },
          }),
          upcomingBillings: upcomingBillings.length,
        },
      };
    });

    res.status(200).json({
      status: 'success',
      data: { dashboard },
    });
  });

  // Get trend analysis
  getTrendAnalysis = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { period = '30d' } = req.query;

    const trends = await prisma.$transaction(async (tx) => {
      // Financial trends
      const financialTrends = await tx.$queryRaw<Array<{
        date: Date;
        income: number;
        expense: number;
        transactions: number;
      }>>`
        SELECT 
          DATE(date) as date,
          COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense,
          COUNT(*) as transactions
        FROM "transactions"
        WHERE "user_id" = ${userId}
          AND date >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(date)
        ORDER BY date
      `;

      // Task trends
      const taskTrends = await tx.$queryRaw<Array<{
        date: Date;
        created: number;
        completed: number;
      }>>`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as created,
          SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as completed
        FROM "tasks"
        WHERE "user_id" = ${userId}
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      return {
        financial: financialTrends.map(trend => ({
          date: trend.date,
          income: Number(trend.income),
          expense: Number(trend.expense),
          net: Number(trend.income) - Number(trend.expense),
          transactions: Number(trend.transactions),
        })),
        productivity: taskTrends.map(trend => ({
          date: trend.date,
          created: Number(trend.created),
          completed: Number(trend.completed),
          efficiency: Number(trend.created) > 0 ? (Number(trend.completed) / Number(trend.created)) * 100 : 0,
        })),
      };
    });

    res.status(200).json({
      status: 'success',
      data: { trends },
    });
  });

  // Helper method to get date filter based on period
  private getDateFilter(period: string): any {
    const now = new Date();
    
    switch (period) {
      case '7d':
        return { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      case '30d':
        return { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      case '90d':
        return { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
      case '1y':
        return { gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
      case 'all':
        return {};
      default:
        return { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }
  }

  // Helper method to calculate growth rate
  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    
    const first = values[0] || 1;
    const last = values[values.length - 1] || 0;
    
    return first > 0 ? ((last - first) / first) * 100 : 0;
  }

  // Generate financial insights
  private generateFinancialInsights(data: any): string[] {
    const insights = [];

    if (data.savingsRate > 20) {
      insights.push(`Great job! You're saving ${data.savingsRate.toFixed(1)}% of your income.`);
    } else if (data.savingsRate < 0) {
      insights.push('You\'re spending more than you earn. Consider reviewing your expenses.');
    }

    if (data.subscriptionTotal > 0) {
      const yearlySubscriptions = data.subscriptionTotal * 12;
      insights.push(`Your subscriptions cost $${yearlySubscriptions.toFixed(2)} per year.`);
    }

    if (data.topCategory) {
      insights.push(`Your biggest expense category is ${data.topCategory}. Look for savings opportunities here.`);
    }

    if (data.expenseGrowth > 20) {
      insights.push('Your expenses have increased significantly. Review recent spending patterns.');
    }

    return insights.length > 0 ? insights : ['Keep tracking your finances to get personalized insights.'];
  }

  // Generate productivity insights
  private generateProductivityInsights(data: any): string[] {
    const insights = [];

    if (data.completionRate > 80) {
      insights.push('Excellent! You\'re completing most of your tasks.');
    } else if (data.completionRate < 50) {
      insights.push('Consider breaking large tasks into smaller, manageable pieces.');
    }

    if (data.overdueRate > 20) {
      insights.push('You have many overdue tasks. Try to prioritize and tackle them first.');
    }

    if (data.totalTasks === 0) {
      insights.push('Start by adding some tasks to track your productivity.');
    }

    return insights.length > 0 ? insights : ['Keep using Mavit to get productivity insights!'];
  }
}

export const analyticsController = new AnalyticsController();