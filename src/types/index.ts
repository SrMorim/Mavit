export type Priority = 'low' | 'medium' | 'high';

export interface Card {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // dd/mm/yy format
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  description?: string;
  color: string; // hex color for the indicator
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  boards: Board[];
  activeBoard: string | null;
  sidebarCollapsed: boolean;
}

export interface CreateBoardData {
  title: string;
  description?: string;
  emoji: string;
}

export interface CreateColumnData {
  title: string;
  description?: string;
  color: string;
}

export interface CreateCardData {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
}

export interface ColumnColors {
  [key: string]: string;
}

export const COLUMN_COLORS: ColumnColors = {
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  gray: '#6b7280',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#3b82f6',    // blue
  medium: '#f59e0b', // yellow
  high: '#ef4444',   // red
};

export const BOARD_EMOJIS = [
  '📋', '📊', '🎯', '🚀', '💼', '📈', '🔥', '⭐',
  '🎨', '💡', '🛠️', '📱', '🌟', '🎪', '🎭', '⚡',
  '🔮', '🎲', '🎸', '🎤', '🎧', '🎮', '🎬', '🃏'
];