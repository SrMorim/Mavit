import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Agora mesmo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h atrás`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d atrás`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} sem atrás`;
  }

  return formatDate(d);
}

export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'low':
      return 'text-green-400 bg-green-500/20';
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/20';
    case 'high':
      return 'text-orange-400 bg-orange-500/20';
    case 'urgent':
      return 'text-red-400 bg-red-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'todo':
      return 'text-gray-400 bg-gray-500/20';
    case 'in_progress':
      return 'text-blue-400 bg-blue-500/20';
    case 'review':
      return 'text-purple-400 bg-purple-500/20';
    case 'done':
      return 'text-green-400 bg-green-500/20';
    case 'cancelled':
      return 'text-red-400 bg-red-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatDueDate(dueDate: string | Date): string {
  const now = new Date();
  const due = new Date(dueDate);
  const diffInMs = due.getTime() - now.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // Se passou do prazo
  if (diffInMs < 0) {
    const pastDays = Math.abs(diffInDays);
    if (pastDays === 0) return 'Venceu hoje';
    if (pastDays === 1) return 'Venceu ontem';
    return `Venceu há ${pastDays} dias`;
  }
  
  // Se vence hoje
  if (diffInDays === 0) {
    const time = due.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    // Verificar se tem horário específico (não é meia-noite)
    if (due.getHours() === 23 && due.getMinutes() === 59) {
      return 'Vence hoje';
    }
    return `Vence hoje às ${time}`;
  }
  
  // Se vence amanhã
  if (diffInDays === 1) {
    const time = due.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    // Verificar se tem horário específico (não é meia-noite)
    if (due.getHours() === 23 && due.getMinutes() === 59) {
      return 'Vence amanhã';
    }
    return `Vence amanhã às ${time}`;
  }
  
  // Se vence em menos de 7 dias
  if (diffInDays < 7) {
    return `Vence em ${diffInDays} dias`;
  }
  
  // Se vence em mais de 7 dias
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Vence em ${weeks} semana${weeks > 1 ? 's' : ''}`;
  }
  
  // Para datas muito distantes, mostrar data formatada
  return `Vence em ${due.toLocaleDateString('pt-BR')}`;
}