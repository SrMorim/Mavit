import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppStore } from '../store';
import { COLUMN_COLORS } from '../types';

interface EditColumnModalProps {
  boardId: string;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EditColumnModal({ boardId, columnId, isOpen, onClose }: EditColumnModalProps) {
  const { boards, updateColumn } = useAppStore();
  const board = boards.find(b => b.id === boardId);
  const column = board?.columns.find(c => c.id === columnId);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    if (column) {
      setFormData({
        title: column.title,
        description: column.description || '',
        color: column.color,
      });
    }
  }, [column]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !column) return;

    updateColumn(boardId, columnId, {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
    });

    onClose();
  };

  const handleClose = () => {
    if (column) {
      setFormData({
        title: column.title,
        description: column.description || '',
        color: column.color,
      });
    }
    onClose();
  };

  if (!column) return null;

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
              <h2 className="text-xl font-semibold text-white">Edit Column</h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-dark-border transition-colors"
              >
                <X size={20} className="text-dark-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Color
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {Object.entries(COLUMN_COLORS).map(([name, color]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        formData.color === color ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

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
                  placeholder="Enter column title..."
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
                  rows={2}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-maver-red focus:border-transparent resize-none"
                  placeholder="Enter column description (optional)..."
                />
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
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}