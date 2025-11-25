'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ListTodoIcon,
  CheckIcon,
  XIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface List {
  id: string;
  name: string;
  description?: string;
  items: ListItem[];
  createdAt: string;
  updatedAt: string;
}

interface ListItem {
  id: string;
  title: string;
  notes?: string;
  priority?: string;
  isCompleted: boolean;
  dueDate?: string;
  order: number;
}

interface CreateListData {
  name: string;
  description?: string;
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [newItemText, setNewItemText] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreateListData>({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.lists.getAll();
      setLists(response.data.data.lists);
    } catch (error) {
      console.error('Error fetching lists:', error);
      toast.error('Erro ao carregar listas');
    } finally {
      setIsLoading(false);
    }
  };

  const createList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      setIsCreating(true);
      
      const response = await apiClient.lists.create(formData);
      const newList = response.data.data.list;
      
      setLists(prev => [newList, ...prev]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Lista criada com sucesso!');
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Erro ao criar lista');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteList = async (listId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta lista?')) {
      return;
    }

    try {
      await apiClient.lists.delete(listId);
      setLists(prev => prev.filter(list => list.id !== listId));
      if (selectedList?.id === listId) {
        setSelectedList(null);
      }
      toast.success('Lista excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Erro ao excluir lista');
    }
  };

  const addItem = async (listId: string) => {
    if (!newItemText.trim()) return;

    try {
      await apiClient.lists.addItem(listId, {
        title: newItemText
      });

      // Refetch the list to get updated items
      const response = await apiClient.lists.getById(listId);
      const updatedList = response.data.data.list;

      setLists(prev => prev.map(list =>
        list.id === listId ? updatedList : list
      ));

      if (selectedList?.id === listId) {
        setSelectedList(updatedList);
      }

      setNewItemText('');
      toast.success('Item adicionado!');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  const toggleItem = async (listId: string, itemId: string, isCompleted: boolean) => {
    try {
      await apiClient.lists.updateItem(listId, itemId, { isCompleted });

      // Refetch the list to get updated items
      const response = await apiClient.lists.getById(listId);
      const updatedList = response.data.data.list;

      setLists(prev => prev.map(list =>
        list.id === listId ? updatedList : list
      ));

      if (selectedList?.id === listId) {
        setSelectedList(updatedList);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const removeItem = async (listId: string, itemId: string) => {
    try {
      await apiClient.lists.removeItem(listId, itemId);

      // Refetch the list to get updated items
      const response = await apiClient.lists.getById(listId);
      const updatedList = response.data.data.list;

      setLists(prev => prev.map(list =>
        list.id === listId ? updatedList : list
      ));

      if (selectedList?.id === listId) {
        setSelectedList(updatedList);
      }

      toast.success('Item removido!');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Erro ao remover item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
  };

  const getListStats = (list: List) => {
    const total = list.items?.length || 0;
    const completed = list.items?.filter(item => item.isCompleted).length || 0;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

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
          <h1 className="text-2xl font-bold text-white">Listas</h1>
          <p className="text-gray-400 mt-1">Organize suas tarefas em listas personalizadas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nova Lista</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lists Grid */}
        <div className="lg:col-span-2 space-y-4">
          {lists.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
              <ListTodoIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhuma lista criada</h3>
              <p className="text-gray-400 mb-4">Crie sua primeira lista para começar a organizar suas tarefas!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Criar Primeira Lista
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lists.map((list) => {
                const stats = getListStats(list);
                return (
                  <div
                    key={list.id}
                    onClick={() => setSelectedList(list)}
                    className={`p-6 rounded-xl border cursor-pointer transition-all ${
                      selectedList?.id === list.id
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white truncate flex-1 mr-2">
                        {list.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteList(list.id);
                        }}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        title="Excluir lista"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {list.description && (
                      <p className="text-gray-400 text-sm mb-3">{list.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          {stats.completed} de {stats.total} concluídos
                        </span>
                        <span className="text-gray-400">{stats.percentage}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-3">
                      {formatRelativeTime(list.updatedAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* List Detail Panel */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          {selectedList ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedList.name}</h2>
                {selectedList.description && (
                  <p className="text-gray-400 text-sm mt-1">{selectedList.description}</p>
                )}
              </div>

              {/* Add new item */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Adicionar novo item..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addItem(selectedList.id);
                    }
                  }}
                />
                <button
                  onClick={() => addItem(selectedList.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  title="Adicionar item"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>

              {/* List items */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedList.items?.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    Esta lista está vazia. Adicione o primeiro item!
                  </p>
                ) : (
                  selectedList.items
                    ?.sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg"
                      >
                        <button
                          onClick={() => toggleItem(selectedList.id, item.id, !item.isCompleted)}
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            item.isCompleted
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-500 hover:border-green-500'
                          }`}
                        >
                          {item.isCompleted && (
                            <CheckIcon className="w-3 h-3 text-white" />
                          )}
                        </button>

                        <span
                          className={`flex-1 ${
                            item.isCompleted
                              ? 'line-through text-gray-500'
                              : 'text-white'
                          }`}
                        >
                          {item.title}
                        </span>
                        
                        <button
                          onClick={() => removeItem(selectedList.id, item.id)}
                          className="flex-shrink-0 p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="Remover item"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ListTodoIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                Selecione uma lista para ver os detalhes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Nova Lista</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createList} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Digite o nome da lista"
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
                  placeholder="Descrição da lista (opcional)"
                />
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
                  {isCreating ? <LoadingSpinner size="sm" /> : 'Criar Lista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}