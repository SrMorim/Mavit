import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, Edit2, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useAppStore } from '../store';
import { Column as ColumnType } from '../types';
import { Card } from './Card';
import { CreateCardModal } from './CreateCardModal';
import { EditColumnModal } from './EditColumnModal';
import { useClickOutside } from '../hooks/useClickOutside';

interface ColumnProps {
  column: ColumnType;
  boardId: string;
}

export function Column({ column, boardId }: ColumnProps) {
  const { deleteColumn } = useAppStore();
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showEditColumn, setShowEditColumn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useClickOutside<HTMLDivElement>(() => setShowMenu(false), showMenu);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column.id}`,
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `column-${column.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDeleteColumn = () => {
    if (confirm('Are you sure you want to delete this column? All cards will be lost.')) {
      deleteColumn(boardId, column.id);
    }
    setShowMenu(false);
  };

  const cardIds = column.cards.map(card => `card-${card.id}`);

  return (
    <>
      <motion.div
        ref={setSortableRef}
        style={style}
        className={`flex flex-col w-80 min-w-80 max-w-80 bg-dark-surface rounded-xl border border-dark-border shadow-card hover:shadow-card-hover transition-all duration-200 ${
          isDragging ? 'opacity-50 rotate-2 scale-105' : ''
        }`}
        layout
        whileHover={{ y: -2 }}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-dark-border">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-dark-surface-hover transition-all duration-200 mr-2 group"
            title="Drag to reorder column"
          >
            <GripVertical size={16} className="text-dark-text-secondary group-hover:text-maver-red transition-colors" />
          </div>

          <div className="flex items-center flex-1">
            <div
              className="w-3 h-3 rounded-full mr-3 shadow-sm"
              style={{ 
                backgroundColor: column.color,
                boxShadow: `0 0 8px ${column.color}40`
              }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white text-base">{column.title}</h3>
              {column.description && (
                <p className="text-sm text-dark-text-secondary mt-1 line-clamp-1">
                  {column.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <motion.span 
              className="text-sm font-medium text-dark-text-secondary mr-3 px-2 py-1 bg-dark-bg rounded-full"
              key={column.cards.length}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {column.cards.length}
            </motion.span>
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 rounded-lg hover:bg-dark-surface-hover transition-all duration-200 group"
                title="Column options"
              >
                <MoreHorizontal size={16} className="text-dark-text-secondary group-hover:text-white transition-colors" />
              </button>
              
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-10 py-1 min-w-[140px]"
                  >
                    <button
                      onClick={() => {
                        setShowEditColumn(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm hover:bg-dark-border transition-colors"
                    >
                      <Edit2 size={14} className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteColumn}
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

        {/* Cards Container */}
        <div
          ref={setDroppableRef}
          className="flex-1 p-3 sm:p-4 space-y-3 overflow-y-auto min-h-[200px]"
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {column.cards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  columnId={column.id}
                  boardId={boardId}
                />
              ))}
            </AnimatePresence>
          </SortableContext>

          {/* Add Card Button */}
          <motion.button
            onClick={() => setShowCreateCard(true)}
            className="w-full flex items-center justify-center p-4 border-2 border-dashed border-dark-border rounded-xl text-dark-text-secondary hover:border-maver-red hover:text-maver-red hover:bg-maver-red/5 transition-all duration-200 group"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} className="mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Add Card</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Modals */}
      <CreateCardModal
        boardId={boardId}
        columnId={column.id}
        isOpen={showCreateCard}
        onClose={() => setShowCreateCard(false)}
      />
      
      <EditColumnModal
        boardId={boardId}
        columnId={column.id}
        isOpen={showEditColumn}
        onClose={() => setShowEditColumn(false)}
      />
    </>
  );
}