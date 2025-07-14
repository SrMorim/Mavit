import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreHorizontal, 
  Download, 
  Upload,
  Edit2,
  Trash2
} from 'lucide-react';
import { useAppStore } from '../store';
import { CreateBoardModal } from './CreateBoardModal';
import { EditBoardModal } from './EditBoardModal';
import { downloadFile, uploadFile } from '../utils';
import { useClickOutside } from '../hooks/useClickOutside';

export function Sidebar() {
  const {
    boards,
    activeBoard,
    sidebarCollapsed,
    toggleSidebar,
    setActiveBoard,
    deleteBoard,
    exportData,
    importData,
  } = useAppStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<string | null>(null);
  const [boardMenuOpen, setBoardMenuOpen] = useState<string | null>(null);

  const menuRef = useClickOutside<HTMLDivElement>(() => setBoardMenuOpen(null), !!boardMenuOpen);

  const handleExport = () => {
    const data = exportData();
    const filename = `mavit-export-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(data, filename);
  };

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

  const handleBoardMenu = (boardId: string, action: 'edit' | 'delete') => {
    if (action === 'edit') {
      setEditingBoard(boardId);
    } else if (action === 'delete') {
      if (confirm('Are you sure you want to delete this board?')) {
        deleteBoard(boardId);
      }
    }
    setBoardMenuOpen(null);
  };

  const handleBoardClick = (boardId: string) => {
    if (boardMenuOpen === boardId) {
      setBoardMenuOpen(null);
    } else {
      setActiveBoard(boardId);
    }
  };

  return (
    <>
      <motion.aside
        className="fixed left-0 top-0 h-full bg-gradient-to-b from-dark-surface to-dark-bg border-r border-dark-border shadow-xl backdrop-blur-sm z-50"
        animate={{
          width: sidebarCollapsed ? '60px' : '280px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-dark-border">
            <motion.div
              className="flex items-center"
              animate={{
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
            >
              <motion.div 
                className="text-2xl"
                animate={{
                  fontSize: sidebarCollapsed ? '1.75rem' : '1.5rem',
                }}
                transition={{ duration: 0.2 }}
              >
                🔥
              </motion.div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="ml-3 text-xl font-bold text-white"
                  >
                    Mavit
                  </motion.h1>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Boards Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between mb-4"
                  >
                    <h2 className="text-sm font-semibold text-dark-text-secondary uppercase tracking-wider">
                      Quadros
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="p-1.5 rounded-lg hover:bg-dark-border transition-colors"
                    >
                      <Plus size={16} className="text-dark-text-secondary" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Board List */}
              <div className="space-y-1">
                {boards.length === 0 ? (
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="text-center py-8"
                      >
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-sm text-dark-text-secondary mb-3">
                          No boards yet
                        </p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="px-4 py-2 bg-gradient-to-r from-maver-red to-maver-red-light text-white rounded-lg hover:shadow-glow-red transition-all duration-200 text-sm font-medium"
                        >
                          Create Board
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  boards.map((board) => (
                    <div key={board.id} className="relative" ref={boardMenuOpen === board.id ? menuRef : undefined}>
                      <motion.button
                        onClick={() => handleBoardClick(board.id)}
                        className={`w-full flex items-center rounded-xl transition-all duration-200 ${
                          sidebarCollapsed ? 'p-2 justify-center' : 'p-3'
                        } ${
                          activeBoard === board.id
                            ? 'bg-gradient-to-r from-maver-red to-maver-red-light text-white shadow-glow-red'
                            : 'hover:bg-dark-surface-hover text-dark-text hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        title={sidebarCollapsed ? board.title : undefined}
                      >
                        <motion.span 
                          className={`text-lg ${sidebarCollapsed ? 'text-xl' : ''}`}
                          animate={{
                            fontSize: sidebarCollapsed ? '1.25rem' : '1.125rem',
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {board.emoji}
                        </motion.span>
                        <AnimatePresence>
                          {!sidebarCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="ml-3 flex-1 text-left"
                            >
                              <div className="font-medium truncate">{board.title}</div>
                              {board.description && (
                                <div className="text-xs opacity-70 truncate">
                                  {board.description}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <AnimatePresence>
                          {!sidebarCollapsed && (
                            <motion.button
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setBoardMenuOpen(boardMenuOpen === board.id ? null : board.id);
                              }}
                              className="ml-2 p-1 rounded hover:bg-black hover:bg-opacity-20 transition-colors"
                            >
                              <MoreHorizontal size={14} />
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      {/* Board Menu */}
                      <AnimatePresence>
                        {boardMenuOpen === board.id && !sidebarCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-10 py-1 min-w-[140px]"
                          >
                            <button
                              onClick={() => handleBoardMenu(board.id, 'edit')}
                              className="w-full flex items-center px-3 py-2 text-sm hover:bg-dark-border transition-colors"
                            >
                              <Edit2 size={14} className="mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleBoardMenu(board.id, 'delete')}
                              className="w-full flex items-center px-3 py-2 text-sm hover:bg-dark-border transition-colors text-red-400"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-dark-border">
            <div className={`flex ${sidebarCollapsed ? 'flex-col space-y-2' : 'space-x-2'}`}>
              <motion.button
                onClick={handleImport}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-dark-border transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Import Data"
              >
                <Upload size={18} className="text-dark-text-secondary" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-2 text-sm"
                    >
                      Import
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              
              <motion.button
                onClick={handleExport}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-dark-border transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Export Data"
              >
                <Download size={18} className="text-dark-text-secondary" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-2 text-sm"
                    >
                      Export
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-dark-surface border border-dark-border rounded-full p-1 hover:bg-dark-border transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={16} className="text-dark-text-secondary" />
            ) : (
              <ChevronLeft size={16} className="text-dark-text-secondary" />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Modals */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      {editingBoard && (
        <EditBoardModal
          boardId={editingBoard}
          isOpen={true}
          onClose={() => setEditingBoard(null)}
        />
      )}
    </>
  );
}