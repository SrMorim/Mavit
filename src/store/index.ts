import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Board, Column, Card, CreateBoardData, CreateColumnData, CreateCardData } from '../types';
import { generateId, createDefaultBoard } from '../utils';

interface AppStore extends AppState {
  // Board actions
  createBoard: (data: CreateBoardData) => void;
  updateBoard: (id: string, data: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  setActiveBoard: (id: string | null) => void;
  
  // Column actions
  createColumn: (boardId: string, data: CreateColumnData) => void;
  updateColumn: (boardId: string, columnId: string, data: Partial<Column>) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  moveColumn: (boardId: string, fromIndex: number, toIndex: number) => void;
  
  // Card actions
  createCard: (boardId: string, columnId: string, data: CreateCardData) => void;
  updateCard: (boardId: string, columnId: string, cardId: string, data: Partial<Card>) => void;
  deleteCard: (boardId: string, columnId: string, cardId: string) => void;
  moveCard: (boardId: string, fromColumnId: string, toColumnId: string, fromIndex: number, toIndex: number) => void;
  
  // UI actions
  toggleSidebar: () => void;
  
  // Data actions
  exportData: () => string;
  importData: (data: string) => boolean;
  resetToDefault: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      boards: [],
      activeBoard: null,
      sidebarCollapsed: false,

      // Board actions
      createBoard: (data) => {
        const newBoard: Board = {
          id: generateId(),
          title: data.title,
          description: data.description,
          emoji: data.emoji,
          columns: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          boards: [...state.boards, newBoard],
          activeBoard: newBoard.id,
        }));
      },

      updateBoard: (id, data) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === id
              ? { ...board, ...data, updatedAt: new Date().toISOString() }
              : board
          ),
        }));
      },

      deleteBoard: (id) => {
        const state = get();
        const remainingBoards = state.boards.filter((board) => board.id !== id);
        
        set({
          boards: remainingBoards,
          activeBoard: state.activeBoard === id ? (remainingBoards[0]?.id || null) : state.activeBoard,
        });
      },

      setActiveBoard: (id) => {
        set({ activeBoard: id });
      },

      // Column actions
      createColumn: (boardId, data) => {
        const newColumn: Column = {
          id: generateId(),
          title: data.title,
          description: data.description,
          color: data.color,
          cards: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: [...board.columns, newColumn],
                  updatedAt: new Date().toISOString(),
                }
              : board
          ),
        }));
      },

      updateColumn: (boardId, columnId, data) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? { ...column, ...data, updatedAt: new Date().toISOString() }
                      : column
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : board
          ),
        }));
      },

      deleteColumn: (boardId, columnId) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.filter((column) => column.id !== columnId),
                  updatedAt: new Date().toISOString(),
                }
              : board
          ),
        }));
      },

      moveColumn: (boardId, fromIndex, toIndex) => {
        set((state) => ({
          boards: state.boards.map((board) => {
            if (board.id !== boardId) return board;

            const columns = [...board.columns];
            const [removed] = columns.splice(fromIndex, 1);
            columns.splice(toIndex, 0, removed);

            return {
              ...board,
              columns,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // Card actions
      createCard: (boardId, columnId, data) => {
        const newCard: Card = {
          id: generateId(),
          title: data.title,
          description: data.description,
          priority: data.priority,
          dueDate: data.dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) => {
                    if (column.id !== columnId) return column;

                    const cards = [...column.cards, newCard];
                    // Sort cards by priority (high first) and then by creation date
                    cards.sort((a, b) => {
                      const priorityOrder = { high: 0, medium: 1, low: 2 };
                      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      }
                      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    });

                    return {
                      ...column,
                      cards,
                      updatedAt: new Date().toISOString(),
                    };
                  }),
                  updatedAt: new Date().toISOString(),
                }
              : board
          ),
        }));
      },

      updateCard: (boardId, columnId, cardId, data) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) => {
                    if (column.id !== columnId) return column;

                    const cards = column.cards.map((card) =>
                      card.id === cardId
                        ? { ...card, ...data, updatedAt: new Date().toISOString() }
                        : card
                    );

                    // Re-sort cards if priority was changed
                    if (data.priority) {
                      cards.sort((a, b) => {
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                          return priorityOrder[a.priority] - priorityOrder[b.priority];
                        }
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                      });
                    }

                    return {
                      ...column,
                      cards,
                      updatedAt: new Date().toISOString(),
                    };
                  }),
                  updatedAt: new Date().toISOString(),
                }
              : board
          ),
        }));
      },

      deleteCard: (boardId, columnId, cardId) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? {
                          ...column,
                          cards: column.cards.filter((card) => card.id !== cardId),
                          updatedAt: new Date().toISOString(),
                        }
                      : column
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : board
          ),
        }));
      },

      moveCard: (boardId, fromColumnId, toColumnId, fromIndex, toIndex) => {
        set((state) => ({
          boards: state.boards.map((board) => {
            if (board.id !== boardId) return board;

            const columns = board.columns.map((column) => ({
              ...column,
              cards: [...column.cards],
            }));

            const fromColumn = columns.find((col) => col.id === fromColumnId);
            const toColumn = columns.find((col) => col.id === toColumnId);

            if (!fromColumn || !toColumn) return board;

            const [movedCard] = fromColumn.cards.splice(fromIndex, 1);
            toColumn.cards.splice(toIndex, 0, movedCard);

            // Re-sort cards in the destination column by priority
            toColumn.cards.sort((a, b) => {
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              }
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            return {
              ...board,
              columns,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // UI actions
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      // Data actions
      exportData: () => {
        const state = get();
        return JSON.stringify({
          boards: state.boards,
          activeBoard: state.activeBoard,
          exportedAt: new Date().toISOString(),
        }, null, 2);
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.boards && Array.isArray(parsed.boards)) {
            set({
              boards: parsed.boards,
              activeBoard: parsed.activeBoard || (parsed.boards[0]?.id || null),
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      resetToDefault: () => {
        set({
          boards: [],
          activeBoard: null,
          sidebarCollapsed: false,
        });
      },
    }),
    {
      name: 'mavit-storage',
      version: 1,
    }
  )
);