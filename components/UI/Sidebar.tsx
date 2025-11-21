import React from 'react';
import { useStore } from '../../store';
import { BRICK_DIMENSIONS, BrickType, LEGO_COLORS } from '../../types';
import { clsx } from 'clsx';

const BrickIcon = ({ type }: { type: string }) => (
  <div className="w-8 h-8 bg-gray-200 rounded border border-gray-400 flex items-center justify-center text-xs">
    {type}
  </div>
);

export const Sidebar: React.FC = () => {
  const { activeBrickType, setBrickType, activeColor, setColor, currentTool } = useStore();

  const brickTypes = Object.keys(BRICK_DIMENSIONS) as BrickType[];

  if (currentTool === 'view') return null;

  return (
    <div className="absolute top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-md shadow-xl border-r border-gray-200 flex flex-col z-10 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <span className="text-lego-red text-2xl">●</span> BrickBuilder
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300">
        {/* Colors */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Colors</h3>
          <div className="grid grid-cols-5 gap-2">
            {LEGO_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => setColor(c.hex)}
                className={clsx(
                  "w-8 h-8 rounded-full shadow-sm hover:scale-110 transition-transform border border-gray-100",
                  activeColor === c.hex && "ring-2 ring-offset-2 ring-blue-500"
                )}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Bricks */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bricks</h3>
          <div className="grid grid-cols-2 gap-3">
            {brickTypes.map((type) => (
              <button
                key={type}
                onClick={() => setBrickType(type)}
                className={clsx(
                  "flex flex-col items-center p-3 rounded-lg border transition-all",
                  activeBrickType === type
                    ? "bg-blue-50 border-blue-500 text-blue-700 shadow-md"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                )}
              >
                 {/* Simple visual representation */}
                 <div className="mb-2 font-mono text-xs font-bold">{type}</div>
                 <div className="text-[10px] text-gray-400">
                    {type.startsWith('plate') ? 'Plate' : 'Brick'}
                 </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t bg-gray-50 text-xs text-gray-500 text-center">
        Press 'R' to Rotate <br/> Del to Delete
      </div>
    </div>
  );
};
