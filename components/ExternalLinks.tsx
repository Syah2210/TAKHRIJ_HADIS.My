import React from 'react';
import { Mail, User, ShieldCheck } from 'lucide-react';

export const ExternalLinks: React.FC = () => {
  return (
    <div className="mt-16 mb-8 text-center border-t border-slate-200 pt-10">
      
      {/* Developer Credits */}
      <div className="flex flex-col items-center gap-3 text-slate-600">
        <div className="flex items-center gap-2 text-sm font-medium bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
          <User size={16} className="text-emerald-600" />
          <span>Dibina oleh: <span className="font-bold text-slate-800">Muhammad Syahmi Aminuddin</span></span>
        </div>
        
        <a 
          href="mailto:syahdinsuhaimi@gmail.com" 
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors group"
        >
          <Mail size={16} className="group-hover:scale-110 transition-transform" />
          <span>syahdinsuhaimi@gmail.com</span>
        </a>
      </div>

      <p className="text-[10px] text-slate-400 mt-6 max-w-lg mx-auto leading-relaxed flex items-center justify-center gap-1">
        <ShieldCheck size={10} />
        Takrij Hadis.my menggunakan teknologi AI. Sentiasa rujuk kitab asal untuk hukum.
      </p>
    </div>
  );
};