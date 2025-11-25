/**
 * Transaction Controller (Finanças Module)
 * Handles CRUD operations for financial transactions with analytics
 */

import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { encryptData, decryptData, decryptUserKey } from '../utils/encryption';
import { parseJsonArrayFields, parseJsonArrayFieldsInList, stringifyJsonArray } from '../utils/jsonArrayHelpers';
import { 
  NotFoundError, 
  ValidationError,
  catchAsync 
} from '../middleware/errorHandler';

class TransactionController {
  // Get transactions with pagination and filters
  getTransactions = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc',
      type,
      category,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      search,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { userId };

    if (type) where.type = type;
    if (category) where.category = category;
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = Number(minAmount);
      if (maxAmount) where.amount.lte = Number(maxAmount);
    }

    // Get transactions with count
    const [rawTransactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        select: {
          id: true,
          title: true,
          description: true,
          amount: true,
          type: true,
          category: true,
          date: true,
          account: true,
          paymentMethod: true,
          tags: true,
          isRecurring: true,
          createdAt: true,
          updatedAt: true,
          subscription: {
            select: {
              id: true,
              name: true,
              billingCycle: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Parse JSON array fields
    const transactions = parseJsonArrayFieldsInList(rawTransactions, ['tags']);

    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasMore: Number(page) < totalPages,
        },
      },
    });
  });

  // Get single transaction
  getTransaction = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const rawTransaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        subscription: {
          select: {
            id: true,
            name: true,
            billingCycle: true,
            nextBilling: true,
          },
        },
      },
    });

    if (!rawTransaction) {
      throw new NotFoundError('Transaction not found');
    }

    // Parse JSON array fields
    const transaction = parseJsonArrayFields(rawTransaction, ['tags']);


    res.status(200).json({
      status: 'success',
      data: { transaction },
    });
  });

  // Create new transaction
  createTransaction = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      title,
      description,
      amount,
      type,
      category,
      date = new Date(),
      account,
      paymentMethod,
      tags = [],
      isRecurring = false,
    } = req.body;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        title,
        description,
        amount: Number(amount),
        type,
        category,
        date: new Date(date),
        account,
        paymentMethod,
        tags: stringifyJsonArray(tags),
        isRecurring,
      },
      select: {
        id: true,
        title: true,
        description: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        account: true,
        paymentMethod: true,
        tags: true,
        isRecurring: true,
        createdAt: true,
      },
    });

    // Parse JSON array fields for response
    const parsedTransaction = parseJsonArrayFields(transaction, ['tags']);

    logger.info('Transaction created:', {
      userId,
      transactionId: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
    });

    res.status(201).json({
      status: 'success',
      data: { transaction: parsedTransaction },
    });
  });

  // Update transaction
  updateTransaction = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existingTransaction) {
      throw new NotFoundError('Transaction not found');
    }

    // Prepare update data with JSON array conversion
    const processedUpdateData = { ...updateData };
    if (updateData.tags !== undefined) {
      processedUpdateData.tags = stringifyJsonArray(updateData.tags);
    }

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...processedUpdateData,
        amount: updateData.amount ? Number(updateData.amount) : undefined,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
      select: {
        id: true,
        title: true,
        description: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        account: true,
        paymentMethod: true,
        tags: true,
        isRecurring: true,
        updatedAt: true,
      },
    });

    // Parse JSON array fields for response
    const parsedTransaction = parseJsonArrayFields(updatedTransaction, ['tags']);

    logger.info('Transaction updated:', {
      userId,
      transactionId: id,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      status: 'success',
      data: { transaction: parsedTransaction },
    });
  });

  // Delete transaction
  deleteTransaction = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const deletedTransaction = await prisma.transaction.deleteMany({
      where: { id, userId },
    });

    if (deletedTransaction.count === 0) {
      throw new NotFoundError('Transaction not found');
    }

    logger.info('Transaction deleted:', {
      userId,
      transactionId: id,
    });

    res.status(200).json({
      status: 'success',
      message: 'Transaction deleted successfully',
    });
  });

  // Get transaction statistics
  getTransactionStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { period = '30', year, month } = req.query;

    let dateFilter: any = {};
    
    if (year && month) {
      // Specific month
      const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
      const endOfMonth = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
      dateFilter = { gte: startOfMonth, lte: endOfMonth };
    } else {
      // Last N days
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - Number(period));
      dateFilter = { gte: daysAgo };
    }

    const stats = await prisma.$transaction(async (tx) => {
      // Basic totals
      const [totalIncome, totalExpense, transactionCount] = await Promise.all([
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

      // By category
      const expensesByCategory = await tx.transaction.groupBy({
        by: ['category'],
        where: { userId, type: 'EXPENSE', date: dateFilter },
        _sum: { amount: true },
        _count: { category: true },
      });

      const incomeByCategory = await tx.transaction.groupBy({
        by: ['category'],
        where: { userId, type: 'INCOME', date: dateFilter },
        _sum: { amount: true },
        _count: { category: true },
      });

      // Monthly trend (last 12 months)
      const monthlyTrend = await tx.$queryRaw<Array<{
        year: number;
        month: number;
        income: number;
        expense: number;
      }>>`
        SELECT 
          EXTRACT(YEAR FROM date) as year,
          EXTRACT(MONTH FROM date) as month,
          COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense
        FROM "transactions"
        WHERE "user_id" = ${userId}
          AND date >= NOW() - INTERVAL '12 months'
        GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
        ORDER BY year, month
      `;

      // Top spending categories
      const topSpendingCategories = expensesByCategory
        .sort((a, b) => Number(b._sum.amount) - Number(a._sum.amount))
        .slice(0, 5);

      return {
        overview: {
          totalIncome: Number(totalIncome._sum.amount || 0),
          totalExpense: Number(totalExpense._sum.amount || 0),
          netIncome: Number(totalIncome._sum.amount || 0) - Number(totalExpense._sum.amount || 0),
          transactionCount,
          averageTransactionSize: transactionCount > 0 
            ? (Number(totalIncome._sum.amount || 0) + Number(totalExpense._sum.amount || 0)) / transactionCount 
            : 0,
        },
        categoryBreakdown: {
          expenses: expensesByCategory.map(cat => ({
            category: cat.category,
            amount: Number(cat._sum.amount),
            count: cat._count.category,
          })),
          income: incomeByCategory.map(cat => ({
            category: cat.category,
            amount: Number(cat._sum.amount),
            count: cat._count.category,
          })),
        },
        monthlyTrend: monthlyTrend.map(item => ({
          year: Number(item.year),
          month: Number(item.month),
          income: Number(item.income),
          expense: Number(item.expense),
          net: Number(item.income) - Number(item.expense),
        })),
        topSpendingCategories: topSpendingCategories.map(cat => ({
          category: cat.category,
          amount: Number(cat._sum.amount),
          count: cat._count.category,
        })),
      };
    });

    res.status(200).json({
      status: 'success',
      data: { statistics: stats },
    });
  });

  // Bulk import transactions
  bulkImport = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { transactions } = req.body;

    const importedTransactions = await prisma.$transaction(async (tx) => {
      const results = [];
      
      for (const transaction of transactions) {
        const created = await tx.transaction.create({
          data: {
            userId,
            ...transaction,
            amount: Number(transaction.amount),
            date: new Date(transaction.date),
            tags: stringifyJsonArray(transaction.tags || []),
          },
          select: { id: true, title: true, amount: true, type: true, tags: true },
        });
        
        // Parse JSON array fields for each imported transaction
        const parsedTransaction = parseJsonArrayFields(created, ['tags']);
        results.push(parsedTransaction);
      }
      
      return results;
    });

    logger.info('Bulk transaction import:', {
      userId,
      importedCount: importedTransactions.length,
    });

    res.status(201).json({
      status: 'success',
      data: {
        imported: importedTransactions.length,
        transactions: importedTransactions,
      },
    });
  });

  // Get financial insights
  getInsights = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    
    const insights = await prisma.$transaction(async (tx) => {
      // Last 30 days vs previous 30 days
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [currentPeriod, previousPeriod] = await Promise.all([
        tx.transaction.aggregate({
          where: { 
            userId, 
            type: 'EXPENSE',
            date: { gte: thirtyDaysAgo, lte: now }
          },
          _sum: { amount: true },
        }),
        tx.transaction.aggregate({
          where: { 
            userId,
            type: 'EXPENSE', 
            date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
          },
          _sum: { amount: true },
        }),
      ]);

      // Find largest expense category
      const topExpenseCategory = await tx.transaction.groupBy({
        by: ['category'],
        where: { 
          userId, 
          type: 'EXPENSE',
          date: { gte: thirtyDaysAgo }
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 1,
      });

      // Find recurring payments (potential subscriptions)
      const recurringTransactions = await tx.transaction.findMany({
        where: {
          userId,
          isRecurring: true,
          type: 'EXPENSE',
        },
        select: {
          id: true,
          title: true,
          amount: true,
          category: true,
        },
      });

      const currentSpending = Number(currentPeriod._sum.amount || 0);
      const previousSpending = Number(previousPeriod._sum.amount || 0);
      const spendingChange = previousSpending > 0 
        ? ((currentSpending - previousSpending) / previousSpending) * 100 
        : 0;

      return {
        spendingTrend: {
          current: currentSpending,
          previous: previousSpending,
          change: spendingChange,
          trend: spendingChange > 0 ? 'increasing' : 'decreasing',
        },
        topSpendingCategory: topExpenseCategory.length > 0 ? {
          category: topExpenseCategory[0].category,
          amount: Number(topExpenseCategory[0]._sum.amount),
        } : null,
        recurringPayments: {
          count: recurringTransactions.length,
          totalAmount: recurringTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
          transactions: recurringTransactions,
        },
        recommendations: generateRecommendations({
          spendingChange,
          topCategory: topExpenseCategory[0]?.category,
          recurringCount: recurringTransactions.length,
        }),
      };
    });

    res.status(200).json({
      status: 'success',
      data: { insights },
    });
  });
}

// Helper function to generate insights
function generateRecommendations(data: any): string[] {
  const recommendations = [];

  if (data.spendingChange > 20) {
    recommendations.push('Your spending increased by more than 20% this month. Consider reviewing your expenses.');
  }

  if (data.topCategory === 'subscriptions') {
    recommendations.push('Subscriptions are your top expense category. Review and cancel unused subscriptions.');
  }

  if (data.recurringCount > 5) {
    recommendations.push(`You have ${data.recurringCount} recurring payments. Consider consolidating or reviewing them.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Great job managing your finances! Keep tracking your expenses regularly.');
  }

  return recommendations;
}

export const transactionController = new TransactionController();