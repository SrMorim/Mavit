import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Edit2, Trash2, AlertCircle, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '../store';
import { Card as CardType, PRIORITY_COLORS } from '../types';
import { isDateOverdue } from '../utils';
import { EditCardModal } from './EditCardModal';
import { useClickOutside } from '../hooks/useClickOutside';

interface CardProps {
  card: CardType;
  columnId: string;
  boardId: string;
}

export function Card({ card, columnId, boardId }: CardProps) {
  const { deleteCard } = useAppStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useClickOutside<HTMLDivElement>(() => setShowMenu(false), showMenu);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card-${card.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDeleteCard = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCard(boardId, columnId, card.id);
    }
    setShowMenu(false);
  };

  const priorityColor = PRIORITY_COLORS[card.priority];
  const isOverdue = card.dueDate ? isDateOverdue(card.dueDate) : false;

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        className={`bg-gradient-to-br from-dark-bg to-dark-bg-secondary border border-dark-border rounded-xl p-4 hover:border-maver-red/50 hover:shadow-glow-red transition-all duration-300 group backdrop-blur-sm ${
          isDragging ? 'opacity-70 rotate-3 scale-105' : ''
        }`}
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        whileHover={{ 
          scale: 1.02,
          y: -2,
          transition: { duration: 0.2 }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(true);
        }}
      >
        {/* Card Header with Drag Handle */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center flex-1">
            <div className="flex items-center mr-2">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${card.priority === 'high' ? 'animate-pulse' : ''}`}
                style={{ 
                  backgroundColor: priorityColor,
                  boxShadow: card.priority === 'high' ? `0 0 8px ${priorityColor}60` : `0 0 4px ${priorityColor}40`
                }}
              />
              <span className={`text-xs font-medium uppercase tracking-wider ${
                card.priority === 'high' ? 'text-red-400 font-bold' :
                card.priority === 'medium' ? 'text-yellow-400' :
                'text-blue-400'
              }`}>
                {card.priority}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-dark-surface-hover transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:scale-110"
              title="Drag to move card"
            >
              <GripVertical size={12} className="text-dark-text-secondary hover:text-maver-red transition-colors" />
            </div>
            
            {/* Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 rounded-lg hover:bg-dark-surface-hover transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:scale-110"
                title="Card options"
              >
                <Edit2 size={12} className="text-dark-text-secondary hover:text-maver-red transition-colors" />
              </button>
            
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-10 py-1 min-w-[120px]"
                  >
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm hover:bg-dark-border transition-colors"
                    >
                      <Edit2 size={14} className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteCard}
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

        {/* Card Title */}
        <h4 className="font-medium text-white mb-2 line-clamp-2">
          {card.title}
        </h4>

        {/* Card Description */}
        {card.description && (
          <p className="text-sm text-dark-text-secondary mb-3 line-clamp-3">
            {card.description}
          </p>
        )}

        {/* Due Date */}
        {card.dueDate && (
          <div className={`flex items-center text-xs ${
            isOverdue ? 'text-red-400' : 'text-dark-text-secondary'
          }`}>
            {isOverdue ? (
              <AlertCircle size={12} className="mr-1" />
            ) : (
              <Calendar size={12} className="mr-1" />
            )}
            <span>
              {isOverdue ? 'Overdue: ' : ''}
              {card.dueDate}
            </span>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <EditCardModal
        boardId={boardId}
        columnId={columnId}
        cardId={card.id}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

    </>
  );
}