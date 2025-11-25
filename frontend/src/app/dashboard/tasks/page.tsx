'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  SearchIcon,
  ChevronDownIcon,
  CheckSquareIcon,
  TagIcon,
  CheckIcon,
  TrashIcon,
  XIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { TaskItem } from '@/components/TaskItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

// Tag interface with color support
interface Tag {
  name: string;
  color: string;
}

// Predefined color options for tags
const TAG_COLORS = [
  { name: 'Vermelho', value: 'red', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500', solid: 'bg-red-500' },
  { name: 'Azul', value: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500', solid: 'bg-blue-500' },
  { name: 'Verde', value: 'green', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500', solid: 'bg-green-500' },
  { name: 'Amarelo', value: 'yellow', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500', solid: 'bg-yellow-500' },
  { name: 'Roxo', value: 'purple', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500', solid: 'bg-purple-500' },
  { name: 'Laranja', value: 'orange', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500', solid: 'bg-orange-500' },
  { name: 'Rosa', value: 'pink', bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500', solid: 'bg-pink-500' },
  { name: 'Cinza', value: 'gray', bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500', solid: 'bg-gray-500' },
];

// Helper function to get tag color classes
const getTagColorClasses = (color: string) => {
  const tagColor = TAG_COLORS.find(c => c.value === color) || TAG_COLORS[0];
  return tagColor!;
};

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

interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  dueTime?: string;
  tags?: string[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  
  // Tag management state
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('red');

  // Form state
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    dueTime: '',
    tags: []
  });

  useEffect(() => {
    fetchTasks();
    loadAvailableTags();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showTagDropdown) {
      return;
    }

    const handleClickOutside = () => {
      setShowTagDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showTagDropdown]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.tasks.getAll();
      setTasks(response.data.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  };

  // Tag management functions
  const loadAvailableTags = () => {
    try {
      const storedTags = localStorage.getItem('mavit_available_tags');
      if (storedTags) {
        const parsed = JSON.parse(storedTags);
        
        // Migration: Convert old string array format to new Tag format
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          const migratedTags: Tag[] = parsed.map((tagName: string) => ({
            name: tagName,
            color: 'red' // Default color for migrated tags
          }));
          setAvailableTags(migratedTags);
          // Save migrated format back to localStorage
          localStorage.setItem('mavit_available_tags', JSON.stringify(migratedTags));
        } else {
          setAvailableTags(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      setAvailableTags([]);
    }
  };

  const saveAvailableTags = (tags: Tag[]) => {
    try {
      localStorage.setItem('mavit_available_tags', JSON.stringify(tags));
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error saving tags:', error);
      toast.error('Erro ao salvar tags');
    }
  };

  const createTag = () => {
    const trimmedName = newTagName.trim();
    
    if (!trimmedName) {
      toast.error('Nome da tag é obrigatório');
      return;
    }

    if (trimmedName.length > 25) {
      toast.error('Nome da tag não pode exceder 25 caracteres');
      return;
    }

    if (!/^[a-zA-Z0-9\-_]+$/.test(trimmedName)) {
      toast.error('Tags podem conter apenas letras, números, hífens e underscores');
      return;
    }

    if (availableTags.some(tag => tag.name === trimmedName)) {
      toast.error('Esta tag já existe');
      return;
    }

    const newTag: Tag = { name: trimmedName, color: newTagColor };
    const newTags = [...availableTags, newTag];
    saveAvailableTags(newTags);
    setNewTagName('');
    setNewTagColor('red');
    toast.success('Tag criada com sucesso!');
  };

  const deleteTag = (tagToDelete: string) => {
    if (confirm(`Tem certeza que deseja excluir a tag "${tagToDelete}"?`)) {
      const newTags = availableTags.filter(tag => tag.name !== tagToDelete);
      saveAvailableTags(newTags);
      
      // Remove from current tag filter if selected
      setTagFilter(prev => prev.filter(tag => tag !== tagToDelete));
      
      toast.success('Tag excluída com sucesso!');
    }
  };

  // Helper function to get tag by name
  const getTagByName = (tagName: string): Tag | undefined => {
    return availableTags.find(tag => tag.name === tagName);
  };

  // Calculate effective priority based on due date proximity
  const getEffectivePriority = (task: Task) => {
    if (!task.dueDate) return task.priority;
    
    const now = new Date();
    const due = new Date(task.dueDate);
    const diffInMs = due.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    // Se passou do prazo - URGENT
    if (diffInMs < 0) return 'URGENT';
    
    // Se vence em menos de 6 horas - HIGH
    if (diffInHours < 6) return 'HIGH';
    
    // Se vence em menos de 24 horas - eleva prioridade em pelo menos MEDIUM
    if (diffInHours < 24) {
      const priorityOrder = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'URGENT': 4 };
      const currentPriority = priorityOrder[task.priority as keyof typeof priorityOrder] || 1;
      const minimumPriority = priorityOrder['MEDIUM'];
      
      if (currentPriority < minimumPriority) {
        return 'MEDIUM';
      }
    }
    
    // Mantém prioridade original
    return task.priority;
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      setIsCreating(true);
      const taskData = {
        ...formData,
        dueDate: formData.dueDate && formData.dueDate.trim() ? 
          (() => {
            // If time is provided, combine date and time
            if (formData.dueTime && formData.dueTime.trim()) {
              return new Date(formData.dueDate + 'T' + formData.dueTime + ':00').toISOString();
            }
            // If only date is provided, use end of day
            return new Date(formData.dueDate + 'T23:59:59').toISOString();
          })() : undefined,
        tags: formData.tags || []
      };
      
      const response = await apiClient.tasks.create(taskData);
      const newTask = response.data.data.task;
      
      setTasks(prev => [newTask, ...prev]);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        dueTime: '',
        tags: []
      });
      toast.success('Tarefa criada com sucesso!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Erro ao criar tarefa');
    } finally {
      setIsCreating(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      await apiClient.tasks.update(taskId, { status });
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
      toast.success('Status da tarefa atualizado!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      await apiClient.tasks.delete(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

  // Filter and sort tasks based on search, filters, and dynamic priority
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesTags = tagFilter.length === 0 || tagFilter.some(selectedTag => 
        task.tags.includes(selectedTag)
      );
      
      return matchesSearch && matchesStatus && matchesPriority && matchesTags;
    })
    .sort((a, b) => {
      const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      
      const aPriority = getEffectivePriority(a);
      const bPriority = getEffectivePriority(b);
      
      // Primeiro por prioridade efetiva (considerando proximidade de vencimento)
      const priorityDiff = priorityOrder[bPriority as keyof typeof priorityOrder] - priorityOrder[aPriority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Depois por data de vencimento (mais próximo primeiro)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      // Tasks com data de vencimento vem antes das sem data
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // Por último, por data de criação (mais recente primeiro)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tarefas</h1>
          <p className="text-gray-400 mt-1">Gerencie suas tarefas e projetos</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTagModal(true)}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <TagIcon className="w-5 h-5" />
            <span>Gerenciar Tags</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar - Full Width */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Todos os Status</option>
            <option value="TODO">Pendente</option>
            <option value="IN_PROGRESS">Em Progresso</option>
            <option value="REVIEW">Em Revisão</option>
            <option value="DONE">Concluída</option>
            <option value="CANCELLED">Cancelada</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="URGENT">Urgente</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Média</option>
            <option value="LOW">Baixa</option>
          </select>

          {/* Tag Filter Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTagDropdown(!showTagDropdown);
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-left focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-between"
            >
              <span>
                {tagFilter.length === 0 
                  ? 'Filtrar por Tags' 
                  : `${tagFilter.length} tag${tagFilter.length > 1 ? 's' : ''}`
                }
              </span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showTagDropdown && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
              >
                {availableTags.length === 0 ? (
                  <div className="px-3 py-2 text-gray-400 text-sm">
                    Nenhuma tag disponível
                  </div>
                ) : (
                  <>
                    {availableTags.map((tag) => {
                      const tagColors = getTagColorClasses(tag.color) ?? TAG_COLORS[0];
                      const isSelected = tagFilter.includes(tag.name);

                      return (
                        <div
                          key={tag.name}
                          onClick={() => {
                            if (isSelected) {
                              setTagFilter(prev => prev.filter(t => t !== tag.name));
                            } else {
                              setTagFilter(prev => [...prev, tag.name]);
                            }
                          }}
                          className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer"
                        >
                          <div className={`w-4 h-4 border-2 rounded mr-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? `${tagColors.border} ${tagColors.bg} ${tagColors.text}`
                              : 'border-gray-500 bg-transparent'
                          }`}>
                            {isSelected && (
                              <CheckIcon className="w-3 h-3" />
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${tagColors.bg} ${tagColors.text} mr-2`}>
                            {tag.name}
                          </span>
                          <span className="text-gray-400 text-sm ml-auto">
                            {tasks.filter(task => task.tags.includes(tag.name)).length}
                          </span>
                        </div>
                      );
                    })}
                    
                    {/* Clear All button */}
                    {tagFilter.length > 0 && (
                      <div className="border-t border-gray-700 p-2">
                        <button
                          onClick={() => setTagFilter([])}
                          className="w-full text-left px-2 py-1 text-sm text-gray-400 hover:text-white"
                        >
                          Limpar seleção
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || priorityFilter !== 'all' || tagFilter.length > 0) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setTagFilter([]);
              }}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <XIcon className="w-4 h-4 mr-1" />
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Active Tag Filters Display */}
      {tagFilter.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Tags filtradas:</span>
          <div className="flex flex-wrap gap-2">
            {tagFilter.map((tagName) => {
              const tag = getTagByName(tagName);
              const tagColors = getTagColorClasses(tag?.color || 'red');
              
              return (
                <span
                  key={tagName}
                  className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${tagColors.bg} ${tagColors.text}`}
                >
                  {tagName}
                  <button
                    onClick={() => setTagFilter(prev => prev.filter(t => t !== tagName))}
                    className="ml-1 opacity-70 hover:opacity-100"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquareIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-400 mb-4">
              {tasks.length === 0 
                ? "Crie sua primeira tarefa para começar!" 
                : "Tente ajustar os filtros de busca."
              }
            </p>
            {tasks.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Criar Primeira Tarefa
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={updateTaskStatus}
              onDelete={deleteTask}
              availableTags={availableTags}
              tagFilter={tagFilter}
              onTagFilterChange={setTagFilter}
              getTagByName={getTagByName}
              getTagColorClasses={getTagColorClasses}
            />
          ))
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Nova Tarefa</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Digite o título da tarefa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                  placeholder="Descreva a tarefa (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      dueDate: e.target.value,
                      // Clear time if date is cleared
                      dueTime: e.target.value ? prev.dueTime : ''
                    }));
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Conditional Time Field - Only show when date is selected */}
              {formData.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Horário de Vencimento (opcional)
                  </label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {/* Tags Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (opcional)
                </label>
                
                {/* Selected Tags Display */}
                {formData.tags && formData.tags.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tagName) => {
                        const tag = getTagByName(tagName);
                        const tagColors = getTagColorClasses(tag?.color || 'red');

                        return (
                          <span
                            key={tagName}
                            className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${tagColors.bg} ${tagColors.text}`}
                          >
                            {tagName}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  tags: prev.tags?.filter(t => t !== tagName) || []
                                }));
                              }}
                              className="ml-1 opacity-70 hover:opacity-100"
                            >
                              <XIcon className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {formData.tags.length} de 10 tags
                    </p>
                  </div>
                )}

                {/* Tag Selection */}
                {availableTags.length > 0 && (
                  <select
                    onChange={(e) => {
                      const selectedTag = e.target.value;
                      if (selectedTag && !formData.tags?.includes(selectedTag) && (formData.tags?.length || 0) < 10) {
                        setFormData(prev => ({
                          ...prev,
                          tags: [...(prev.tags || []), selectedTag]
                        }));
                      } else if ((formData.tags?.length || 0) >= 10) {
                        toast.error('Máximo de 10 tags atingido');
                      }
                      e.target.value = '';
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    defaultValue=""
                    disabled={(formData.tags?.length || 0) >= 10}
                  >
                    <option value="" disabled>
                      {(formData.tags?.length || 0) >= 10 ? 'Máximo de tags atingido' : 'Selecione uma tag'}
                    </option>
                    {availableTags
                      .filter(tag => !formData.tags?.includes(tag.name))
                      .map((tag) => (
                        <option key={tag.name} value={tag.name}>
                          {tag.name}
                        </option>
                      ))}
                  </select>
                )}

                {availableTags.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Nenhuma tag disponível. Use "Gerenciar Tags" para criar novas tags.
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  {isCreating ? <LoadingSpinner size="sm" /> : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tag Management Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Gerenciar Tags</h2>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Create New Tag */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nova Tag
              </label>
              
              {/* Tag Name Input */}
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createTag()}
                  placeholder="Ex: faculdade, trabalho, pessoal..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={createTag}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Color Selector */}
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Cor da Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLORS.map((color) => {
                    const isSelected = newTagColor === color.value;
                    return (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewTagColor(color.value)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? `${color.border} ${color.bg}` 
                            : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        }`}
                        title={color.name}
                      >
                        <div className={`w-3 h-3 rounded-full ${color.solid}`}></div>
                        <span className={`text-xs ${isSelected ? color.text : 'text-gray-300'}`}>
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Use apenas letras, números, hífens e underscores. Máximo 25 caracteres.
              </p>
            </div>

            {/* Existing Tags */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">
                Tags Existentes ({availableTags.length})
              </h3>
              
              {availableTags.length === 0 ? (
                <div className="text-center py-8">
                  <TagIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">Nenhuma tag criada ainda</p>
                  <p className="text-sm text-gray-500">
                    Crie sua primeira tag para organizar suas tarefas!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableTags.map((tag) => {
                    const tagColors = getTagColorClasses(tag.color);
                    return (
                      <div
                        key={tag.name}
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${tagColors.bg} ${tagColors.text}`}>
                            {tag.name}
                          </span>
                          <span className="text-sm text-gray-400">
                            {tasks.filter(task => task.tags.includes(tag.name)).length} tarefas
                          </span>
                        </div>
                        <button
                          onClick={() => deleteTag(tag.name)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title={`Excluir tag: ${tag.name}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}