import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppStore } from '../store';
import { Board as BoardType } from '../types';
import { Column } from './Column';
import { CreateColumnModal } from './CreateColumnModal';
import { EditBoardModal } from './EditBoardModal';
import { useClickOutside } from '../hooks/useClickOutside';

interface BoardProps {
  board: BoardType;
}

export function Board({ board }: BoardProps) {
  const { moveColumn, moveCard, deleteBoard } = useAppStore();
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [showEditBoard, setShowEditBoard] = useState(false);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  
  const menuRef = useClickOutside<HTMLDivElement>(() => setShowBoardMenu(false), showBoardMenu);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Handle column reordering
    if (activeId.startsWith('column-') && overId.startsWith('column-')) {
      const activeColumnIndex = board.columns.findIndex(col => `column-${col.id}` === activeId);
      const overColumnIndex = board.columns.findIndex(col => `column-${col.id}` === overId);
      
      if (activeColumnIndex !== -1 && overColumnIndex !== -1 && activeColumnIndex !== overColumnIndex) {
        moveColumn(board.id, activeColumnIndex, overColumnIndex);
      }
      return;
    }

    // Handle card movement
    if (activeId.startsWith('card-')) {
      const cardId = activeId.replace('card-', '');
      
      // Find source column
      let sourceColumn = null;
      let sourceCardIndex = -1;
      
      for (const column of board.columns) {
        const cardIndex = column.cards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
          sourceColumn = column;
          sourceCardIndex = cardIndex;
          break;
        }
      }
      
      if (!sourceColumn) return;

      // Determine target column
      let targetColumnId = '';
      let targetCardIndex = 0;
      
      if (overId.startsWith('column-')) {
        // Dropped on column
        targetColumnId = overId.replace('column-', '');
        const targetColumn = board.columns.find(col => col.id === targetColumnId);
        targetCardIndex = targetColumn ? targetColumn.cards.length : 0;
      } else if (overId.startsWith('card-')) {
        // Dropped on card
        const targetCardId = overId.replace('card-', '');
        for (const column of board.columns) {
          const cardIndex = column.cards.findIndex(card => card.id === targetCardId);
          if (cardIndex !== -1) {
            targetColumnId = column.id;
            targetCardIndex = cardIndex;
            break;
          }
        }
      }
      
      if (targetColumnId && (sourceColumn.id !== targetColumnId || sourceCardIndex !== targetCardIndex)) {
        moveCard(board.id, sourceColumn.id, targetColumnId, sourceCardIndex, targetCardIndex);
      }
    }
  };

  const handleBoardMenu = (action: 'edit' | 'delete') => {
    if (action === 'edit') {
      setShowEditBoard(true);
    } else if (action === 'delete') {
      if (confirm('Are you sure you want to delete this board? All columns and cards will be lost.')) {
        deleteBoard(board.id);
      }
    }
    setShowBoardMenu(false);
  };

  const columnIds = board.columns.map(column => `column-${column.id}`);

  const contentWidth = board.columns.length * 344 + 48; // 320px per column + 24px spacing + padding
  const shouldScroll = contentWidth > 1200; // Force scroll when content is wider than typical screen

  return (
    <div className="flex flex-col h-full w-full">
      {/* Board Header - Sticky Fixed Position */}
      <div className="sticky top-0 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border z-50 flex-shrink-0">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between w-full">
            {/* Left side - Board info */}
            <div className="flex items-center flex-1 min-w-0">
              <span className="text-2xl sm:text-3xl mr-3 flex-shrink-0">{board.emoji}</span>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{board.title}</h1>
                {board.description && (
                  <p className="text-dark-text-secondary mt-1 text-sm sm:text-base truncate">
                    {board.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Right side - Fixed buttons */}
            <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
              <motion.button
                onClick={() => setShowCreateColumn(true)}
                className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-maver-red to-maver-red-light text-white rounded-lg hover:shadow-glow-red transition-all duration-200 group font-medium text-sm"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform duration-200" />
                <span className="whitespace-nowrap hidden sm:inline">Add Column</span>
                <span className="whitespace-nowrap sm:hidden">Add</span>
              </motion.button>
              
              {/* Board Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowBoardMenu(!showBoardMenu)}
                  className="p-2 rounded-lg hover:bg-dark-surface-hover transition-all duration-200 group"
                  title="Board options"
                >
                  <MoreHorizontal size={16} className="text-dark-text-secondary group-hover:text-white transition-colors" />
                </button>
                
                <AnimatePresence>
                  {showBoardMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-50 py-1 min-w-[140px]"
                    >
                      <button
                        onClick={() => handleBoardMenu('edit')}
                        className="w-full flex items-center px-3 py-2 text-sm hover:bg-dark-border transition-colors"
                      >
                        <Edit2 size={14} className="mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleBoardMenu('delete')}
                        className="w-full flex items-center px-3 py-2 text-sm hover:bg-dark-border transition-colors text-red-400"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Board Content - Scrollable Area */}
      <div 
        className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-custom"
        style={{ 
          scrollbarGutter: 'stable',
          minHeight: 0 // Allow flex item to shrink
        }}
      >
        <DndContext
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div 
            className="flex p-4 sm:p-6 space-x-4 sm:space-x-6 h-full" 
            style={{ 
              width: shouldScroll ? `${contentWidth}px` : '100%',
              minWidth: shouldScroll ? `${contentWidth}px` : 'auto'
            }}
          >
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              {board.columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  boardId={board.id}
                />
              ))}
            </SortableContext>
            
            {/* Empty state or add column button */}
            {board.columns.length === 0 && (
              <div className="flex items-center justify-center w-full min-h-[300px] sm:min-h-[400px]">
                <div className="text-center p-4">
                  <div className="text-4xl sm:text-6xl mb-4">📋</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-dark-text mb-2">
                    No columns yet
                  </h3>
                  <p className="text-dark-text-secondary mb-6 text-sm sm:text-base">
                    Create your first column to start organizing tasks
                  </p>
                  <motion.button
                    onClick={() => setShowCreateColumn(true)}
                    className="px-4 sm:px-6 py-3 bg-maver-red text-white rounded-lg hover:bg-maver-red-dark transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Create Column
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </DndContext>
      </div>

      {/* Modals */}
      <CreateColumnModal
        boardId={board.id}
        isOpen={showCreateColumn}
        onClose={() => setShowCreateColumn(false)}
      />
      
      <EditBoardModal
        boardId={board.id}
        isOpen={showEditBoard}
        onClose={() => setShowEditBoard(false)}
      />
    </div>
  );
}