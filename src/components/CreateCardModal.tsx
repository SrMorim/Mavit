import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { useAppStore } from '../store';
import { Priority, PRIORITY_COLORS } from '../types';
import { formatDate } from '../utils';

interface CreateCardModalProps {
  boardId: string;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCardModal({ boardId, columnId, isOpen, onClose }: CreateCardModalProps) {
  const { createCard } = useAppStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    dueDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    createCard(boardId, columnId, {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
    });

    setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
    onClose();
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
    onClose();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (date) {
      const formatted = formatDate(new Date(date).toISOString());
      setFormData({ ...formData, dueDate: formatted });
    } else {
      setFormData({ ...formData, dueDate: '' });
    }
  };

  const priorities: { value: Priority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-dark-surface rounded-lg p-6 w-full max-w-md mx-4 border border-dark-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Create New Card</h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-dark-border transition-colors"
              >
                <X size={20} className="text-dark-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-maver-red focus:border-transparent"
                  placeholder="Enter card title..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-maver-red focus:border-transparent resize-none"
                  placeholder="Enter card description..."
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: priority.value })}
                      className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                        formData.priority === priority.value
                          ? 'border-white bg-opacity-20'
                          : 'border-dark-border hover:border-dark-text-secondary'
                      }`}
                      style={{
                        backgroundColor: formData.priority === priority.value 
                          ? PRIORITY_COLORS[priority.value] + '20' 
                          : 'transparent'
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: PRIORITY_COLORS[priority.value] }}
                      />
                      <span className="text-sm font-medium">{priority.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-maver-red focus:border-transparent"
                  />
                  <Calendar 
                    size={18} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-text-secondary pointer-events-none" 
                  />
                </div>
                {formData.dueDate && (
                  <p className="text-sm text-dark-text-secondary mt-1">
                    Formatted: {formData.dueDate}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-dark-border rounded-lg text-dark-text hover:bg-dark-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.title.trim()}
                  className="flex-1 px-4 py-2 bg-maver-red text-white rounded-lg hover:bg-maver-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Card
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}