import { create } from 'zustand';
import { BrickData, BrickType, ToolMode } from './types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  bricks: BrickData[];
  history: BrickData[][];
  historyIndex: number;
  selectedBrickIds: string[];
  currentTool: ToolMode;
  activeColor: string;
  activeBrickType: BrickType;
  isAiGenerating: boolean;
  
  // Actions
  addBrick: (brick: Omit<BrickData, 'id'>) => void;
  removeBrick: (id: string) => void;
  updateBrick: (id: string, updates: Partial<BrickData>) => void;
  selectBrick: (id: string, multi?: boolean) => void;
  deselectAll: () => void;
  setTool: (tool: ToolMode) => void;
  setColor: (color: string) => void;
  setBrickType: (type: BrickType) => void;
  setAiGenerating: (loading: boolean) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveSnapshot: () => void;
  loadProject: (bricks: BrickData[]) => void;
}

export const useStore = create<AppState>((set, get) => ({
  bricks: [],
  history: [[]],
  historyIndex: 0,
  selectedBrickIds: [],
  currentTool: 'place',
  activeColor: '#C91A09',
  activeBrickType: '2x4',
  isAiGenerating: false,

  addBrick: (brickData) => {
    const newBrick = { ...brickData, id: uuidv4() };
    const newBricks = [...get().bricks, newBrick];
    set({ bricks: newBricks });
    get().saveSnapshot();
  },

  removeBrick: (id) => {
    const newBricks = get().bricks.filter((b) => b.id !== id);
    set({ bricks: newBricks, selectedBrickIds: [] });
    get().saveSnapshot();
  },

  updateBrick: (id, updates) => {
    const newBricks = get().bricks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    set({ bricks: newBricks });
    get().saveSnapshot();
  },

  selectBrick: (id, multi = false) => {
    if (multi) {
      const currentSelected = get().selectedBrickIds;
      if (currentSelected.includes(id)) {
        set({ selectedBrickIds: currentSelected.filter((sid) => sid !== id) });
      } else {
        set({ selectedBrickIds: [...currentSelected, id] });
      }
    } else {
      set({ selectedBrickIds: [id] });
    }
  },

  deselectAll: () => set({ selectedBrickIds: [] }),
  setTool: (tool) => set({ currentTool: tool, selectedBrickIds: [] }),
  setColor: (color) => set({ activeColor: color }),
  setBrickType: (type) => set({ activeBrickType: type }),
  setAiGenerating: (loading) => set({ isAiGenerating: loading }),

  saveSnapshot: () => {
    const { bricks, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(bricks)));
    
    // Limit history size
    if (newHistory.length > 50) newHistory.shift();
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        bricks: JSON.parse(JSON.stringify(history[newIndex])),
        historyIndex: newIndex
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        bricks: JSON.parse(JSON.stringify(history[newIndex])),
        historyIndex: newIndex
      });
    }
  },

  loadProject: (bricks) => {
    set({ bricks: bricks, history: [bricks], historyIndex: 0 });
  }
}));
