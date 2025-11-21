import React, { useState } from 'react';
import { useStore } from '../../store';
import { ToolMode } from '../../types';
import { 
  MousePointer2, 
  Box, 
  Eraser, 
  PaintBucket, 
  Eye, 
  Undo2, 
  Redo2, 
  Download, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { generateBricksFromPrompt } from '../../services/geminiService';

export const Toolbar: React.FC = () => {
  const { 
    currentTool, 
    setTool, 
    undo, 
    redo, 
    bricks, 
    isAiGenerating, 
    setAiGenerating,
    addBrick,
    loadProject
  } = useStore();
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  const tools: { id: ToolMode; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer2 size={20} />, label: 'Select' },
    { id: 'place', icon: <Box size={20} />, label: 'Build' },
    { id: 'paint', icon: <PaintBucket size={20} />, label: 'Paint' },
    { id: 'erase', icon: <Eraser size={20} />, label: 'Erase' },
    { id: 'view', icon: <Eye size={20} />, label: 'View' },
  ];

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const generatedBricks = await generateBricksFromPrompt(aiPrompt);
      // Clear current and load new, or append? Let's load new for clarity in this demo
      if (generatedBricks.length > 0) {
        // Map AI result format to our format if needed, but schema matches well
        // Ensure valid IDs
        const validBricks = generatedBricks.map(b => ({
           ...b,
           id: crypto.randomUUID(),
           // ensure positions are valid numbers
           position: b.position.map((p: any) => Number(p)),
           rotation: Number(b.rotation)
        }));
        loadProject(validBricks);
        setShowAiModal(false);
        setAiPrompt('');
      }
    } catch (e) {
      alert('AI Generation failed. Check console/API Key.');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-2xl px-6 py-3 flex items-center gap-6 z-20">
        {/* History Controls */}
        <div className="flex gap-2 mr-4 border-r border-gray-300 pr-4">
          <button onClick={undo} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Undo (Ctrl+Z)">
            <Undo2 size={20} />
          </button>
          <button onClick={redo} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Redo (Ctrl+Y)">
            <Redo2 size={20} />
          </button>
        </div>

        {/* Tools */}
        <div className="flex gap-2">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`flex flex-col items-center gap-1 p-2 px-3 rounded-xl transition-all ${
                currentTool === t.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {t.icon}
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Extras */}
        <div className="flex gap-2 ml-4 border-l border-gray-300 pl-4">
          <button 
            onClick={() => setShowAiModal(true)} 
            className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110"
            title="AI Assistant"
          >
            <Sparkles size={20} />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600" 
            onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bricks));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href",     dataStr);
                downloadAnchorNode.setAttribute("download", "brick_project.json");
                document.body.appendChild(downloadAnchorNode); // required for firefox
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            }}
            title="Export JSON"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="text-purple-500" /> AI Architect
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Describe what you want to build (e.g., "A small red house with a chimney" or "A blue spaceship").
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none h-32"
              placeholder="Type your imagination here..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setShowAiModal(false)} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleAiGenerate}
                disabled={isAiGenerating || !aiPrompt}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isAiGenerating ? <Loader2 className="animate-spin" size={16} /> : 'Generate Build'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
