import { Board, Column, Card } from '../types';

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatDate(date: string): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString().substr(-2);
  return `${day}/${month}/${year}`;
}

export function parseDate(dateString: string): Date | null {
  const [day, month, year] = dateString.split('/');
  if (!day || !month || !year) return null;
  
  const fullYear = parseInt(year) + (parseInt(year) > 50 ? 1900 : 2000);
  const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
  
  return isNaN(date.getTime()) ? null : date;
}

export function isDateOverdue(dateString?: string): boolean {
  if (!dateString) return false;
  const date = parseDate(dateString);
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
}

export function createDefaultBoard(): Board {
  const boardId = 'default-board';
  const now = new Date().toISOString();
  
  const todoColumn: Column = {
    id: generateId(),
    title: 'To Do',
    description: 'Tasks to be started',
    color: '#ef4444',
    cards: [
      {
        id: generateId(),
        title: 'Welcome to Mavit!',
        description: 'This is your first Kanban board. You can create, edit, and organize your tasks here.',
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        title: 'Create your first task',
        description: 'Click the + button to add a new card to any column.',
        priority: 'low',
        createdAt: now,
        updatedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
  
  const inProgressColumn: Column = {
    id: generateId(),
    title: 'In Progress',
    description: 'Currently working on',
    color: '#f59e0b',
    cards: [
      {
        id: generateId(),
        title: 'Explore Mavit features',
        description: 'Try drag and drop, priorities, and due dates.',
        priority: 'high',
        dueDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 1 week from now
        createdAt: now,
        updatedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
  
  const doneColumn: Column = {
    id: generateId(),
    title: 'Done',
    description: 'Completed tasks',
    color: '#10b981',
    cards: [],
    createdAt: now,
    updatedAt: now,
  };

  return {
    id: boardId,
    title: 'First Board',
    description: 'Your first Kanban board to get started',
    emoji: '📋',
    columns: [todoColumn, inProgressColumn, doneColumn],
    createdAt: now,
    updatedAt: now,
  };
}

export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function uploadFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    
    input.click();
  });
}