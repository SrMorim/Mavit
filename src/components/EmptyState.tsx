import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import { CreateBoardModal } from './CreateBoardModal';
import { uploadFile } from '../utils';

export function EmptyState() {
  const { importData } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleImport = async () => {
    try {
      const data = await uploadFile();
      const success = importData(data);
      if (!success) {
        alert('Failed to import data. Please check the file format.');
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import file.');
    }
  };

  return (
    <>
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Icon */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 100
            }}
          >
            <div className="text-6xl mb-4 relative">
              📋
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                ✨
              </motion.div>
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.h1 
            className="text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome to Mavit
          </motion.h1>
          
          <motion.p 
            className="text-dark-text-secondary mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Create your first Kanban board to organize tasks, manage projects, and boost productivity with our intuitive drag-and-drop interface.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Primary Action */}
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-maver-red to-maver-red-light text-white rounded-xl hover:shadow-glow-red transition-all duration-200 group font-medium text-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={24} className="mr-3 group-hover:rotate-90 transition-transform duration-200" />
              Create Your First Board
              <Sparkles size={20} className="ml-3 opacity-80" />
            </motion.button>

            {/* Secondary Action */}
            <motion.button
              onClick={handleImport}
              className="w-full flex items-center justify-center px-6 py-3 border-2 border-dark-border rounded-xl text-dark-text hover:border-maver-red hover:text-maver-red hover:bg-maver-red/5 transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload size={18} className="mr-2 group-hover:scale-110 transition-transform" />
              Import Existing Data
            </motion.button>
          </motion.div>

          {/* Feature Hints */}
          <motion.div 
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="p-4 rounded-lg bg-dark-surface/50 border border-dark-border/50">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm text-dark-text-secondary">
                Organize tasks with priorities
              </p>
            </div>
            <div className="p-4 rounded-lg bg-dark-surface/50 border border-dark-border/50">
              <div className="text-2xl mb-2">📅</div>
              <p className="text-sm text-dark-text-secondary">
                Set due dates and deadlines
              </p>
            </div>
            <div className="p-4 rounded-lg bg-dark-surface/50 border border-dark-border/50">
              <div className="text-2xl mb-2">🚀</div>
              <p className="text-sm text-dark-text-secondary">
                Drag & drop simplicity
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}