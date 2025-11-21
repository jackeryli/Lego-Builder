import React, { Suspense } from 'react';
import { Scene } from './components/Scene';
import { Sidebar } from './components/UI/Sidebar';
import { Toolbar } from './components/UI/Toolbar';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen bg-gray-100 overflow-hidden relative font-sans selection:bg-blue-200">
      
      <Sidebar />
      
      <main className="w-full h-full absolute inset-0 z-0">
        <Suspense 
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin" size={40} />
                <p className="font-medium">Loading 3D Engine...</p>
              </div>
            </div>
          }
        >
          <Scene />
        </Suspense>
      </main>

      <Toolbar />

      {/* Top Right Info */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-xs font-medium text-gray-500">
          v1.0.0 • BrickBuilder AI
        </div>
      </div>
    </div>
  );
};

export default App;
