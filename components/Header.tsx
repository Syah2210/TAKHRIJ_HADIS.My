import React from 'react';
import { BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg text-slate-900 shadow-emerald-500/20 shadow-lg">
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Takhrij Hadis<span className="text-emerald-400">.my</span></h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Semak sebelum sebar</p>
          </div>
        </div>
      </div>
    </header>
  );
};