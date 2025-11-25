// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Task Types (Backlog Module)
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
  event?: Event;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED';

// Event Types (Calendar Module)
export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  isRecurring: boolean;
  recurrence?: Recurrence;
  reminders: number[];
  location?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
}

export type Recurrence = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

// Note Types (Bloco de Notas Module)
export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  hasImages: boolean;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
}

// List Types (Listas Module)
export interface List {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isShared: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  items: ListItem[];
}

export interface ListItem {
  id: string;
  title: string;
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
  priority: Priority;
  order: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types (Finanças Module)
export interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  account?: string;
  paymentMethod?: string;
  tags: string[];
  isRecurring: boolean;
  createdAt: string;
  subscription?: Subscription;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Subscription {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billingCycle: SubscriptionCycle;
  nextBilling: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  category?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any[];
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}

// Form Types
export interface TaskFormData {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  startDate?: string;
  tags: string[];
  estimatedHours?: number;
}

export interface NoteFormData {
  title: string;
  content: string;
  category?: string;
  tags: string[];
}

export interface TransactionFormData {
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  account?: string;
  paymentMethod?: string;
  tags: string[];
  isRecurring: boolean;
}

// Filter and Search Types
export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  tags?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface NoteFilters {
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}