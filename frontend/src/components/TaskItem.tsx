'use client';

import React from 'react';
import {
  ClockIcon,
  CalendarIcon,
  TagIcon,
  CheckIcon,
  TrashIcon,
  XIcon
} from 'lucide-react';
import { formatRelativeTime, formatDueDate } from '@/lib/utils';

// Tag interface
interface Tag {
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  dueTime?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface TagColor {
  name: string;
  value: string;
  bg: string;
  text: string;
  border: string;
  solid: string;
}

interface TaskItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onDelete: (taskId: string) => void;
  availableTags: Tag[];
  tagFilter: string[];
  onTagFilterChange: (filter: string[]) => void;
  getTagByName: (tagName: string) => Tag | undefined;
  getTagColorClasses: (color: string) => TagColor;
}

// Helper function to get urgency status
const getTaskUrgencyStatus = (task: Task): 'overdue' | 'urgent' | 'today' | 'normal' => {
  if (!task.dueDate) return 'normal';

  const now = new Date();
  const due = new Date(task.dueDate);
  const diffInMs = due.getTime() - now.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInMs < 0) return 'overdue';
  if (diffInHours < 6) return 'urgent';
  if (diffInHours < 24) return 'today';

  return 'normal';
};

// Helper function to get effective priority
const getEffectivePriority = (task: Task): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' => {
  if (!task.dueDate) return task.priority;

  const now = new Date();
  const due = new Date(task.dueDate);
  const diffInMs = due.getTime() - now.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInMs < 0) return 'URGENT';
  if (diffInHours < 6) return 'HIGH';

  if (diffInHours < 24) {
    const priorityOrder = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'URGENT': 4 };
    const currentPriority = priorityOrder[task.priority as keyof typeof priorityOrder] || 1;
    const minimumPriority = priorityOrder['MEDIUM'];

    if (currentPriority < minimumPriority) {
      return 'MEDIUM';
    }
  }

  return task.priority;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'URGENT': return 'text-purple-400 bg-purple-500/20';
    case 'HIGH': return 'text-red-400 bg-red-500/20';
    case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
    case 'LOW': return 'text-green-400 bg-green-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DONE': return 'text-green-400 bg-green-500/20';
    case 'IN_PROGRESS': return 'text-blue-400 bg-blue-500/20';
    case 'REVIEW': return 'text-yellow-400 bg-yellow-500/20';
    case 'TODO': return 'text-gray-400 bg-gray-500/20';
    case 'CANCELLED': return 'text-red-400 bg-red-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

export function TaskItem({
  task,
  onStatusChange,
  onDelete,
  availableTags,
  tagFilter,
  onTagFilterChange,
  getTagByName,
  getTagColorClasses
}: TaskItemProps) {
  const urgencyStatus = getTaskUrgencyStatus(task);
  const effectivePriority = getEffectivePriority(task);

  // Define CSS classes based on urgency
  let taskClasses = "bg-gray-800 rounded-xl p-6 border transition-colors ";

  switch (urgencyStatus) {
    case 'overdue':
      taskClasses += "border-red-500 bg-red-900/20 hover:border-red-400";
      break;
    case 'urgent':
      taskClasses += "border-orange-500 bg-orange-900/10 hover:border-orange-400";
      break;
    case 'today':
      taskClasses += "border-yellow-500 bg-yellow-900/10 hover:border-yellow-400";
      break;
    default:
      taskClasses += "border-gray-700 hover:border-gray-600";
  }

  return (
    <div
      key={task.id}
      className={taskClasses}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{task.title}</h3>

            {/* Effective priority (considering proximity to due date) */}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(effectivePriority)}`}>
              {effectivePriority === 'URGENT' ? 'Urgente' : effectivePriority === 'HIGH' ? 'Alta' : effectivePriority === 'MEDIUM' ? 'Média' : 'Baixa'}
              {effectivePriority !== task.priority && (
                <span className="ml-1 opacity-70">⏰</span>
              )}
            </span>

            {/* Status */}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
              {task.status === 'DONE' ? 'Concluída' :
               task.status === 'IN_PROGRESS' ? 'Em Progresso' :
               task.status === 'REVIEW' ? 'Em Revisão' :
               task.status === 'CANCELLED' ? 'Cancelada' : 'Pendente'}
            </span>

            {/* Urgency indicator */}
            {urgencyStatus === 'overdue' && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500 text-white">
                🚨 ATRASADA
              </span>
            )}
            {urgencyStatus === 'urgent' && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-500 text-white">
                ⚡ URGENTE
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-gray-300 mb-3">{task.description}</p>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{formatRelativeTime(task.createdAt)}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDueDate(task.dueDate)}</span>
              </div>
            )}
            {task.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <TagIcon className="w-4 h-4" />
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tagName) => {
                    const tag = getTagByName(tagName);
                    const tagColors = getTagColorClasses(tag?.color || 'red');

                    return (
                      <button
                        key={tagName}
                        onClick={() => {
                          if (!tagFilter.includes(tagName)) {
                            onTagFilterChange([...tagFilter, tagName]);
                          }
                        }}
                        className={`inline-flex items-center px-2 py-1 text-xs rounded-full transition-colors cursor-pointer ${tagColors.bg} ${tagColors.text} hover:opacity-80`}
                        title={`Filtrar por tag: ${tagName}`}
                      >
                        {tagName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Status Actions */}
        {task.status !== 'DONE' && (
          <button
            onClick={() => onStatusChange(task.id, 'DONE')}
            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
            title="Marcar como concluída"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
        )}

        {task.status === 'TODO' && (
          <button
            onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
            title="Marcar como em progresso"
          >
            <ClockIcon className="w-4 h-4" />
          </button>
        )}

        {task.status === 'DONE' && (
          <button
            onClick={() => onStatusChange(task.id, 'TODO')}
            className="p-2 text-gray-400 hover:bg-gray-500/20 rounded-lg transition-colors"
            title="Marcar como pendente"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
          title="Excluir tarefa"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
