import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from './store';
import { Sidebar } from './components/Sidebar';
import { Board } from './components/Board';
import { EmptyState } from './components/EmptyState';

function App() {
  const { boards, activeBoard, sidebarCollapsed } = useAppStore();
  const currentBoard = boards.find(board => board.id === activeBoard);

  return (
    <div className="flex h-screen bg-dark-bg text-dark-text">
      <Sidebar />
      
      <motion.main
        className="flex-1 flex flex-col min-w-0"
        animate={{
          marginLeft: sidebarCollapsed ? '60px' : '280px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {boards.length === 0 ? (
          <EmptyState />
        ) : currentBoard ? (
          <Board board={currentBoard} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-dark-text-secondary mb-2">
                No board selected
              </h2>
              <p className="text-dark-text-secondary">
                Select a board from the sidebar to get started
              </p>
            </div>
          </div>
        )}
      </motion.main>
    </div>
  );
}

export default App;