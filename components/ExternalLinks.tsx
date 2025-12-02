import React, { useState } from 'react';
import { Mail, User, ShieldCheck, Heart, X, Coffee, Copy, Check } from 'lucide-react';

export const ExternalLinks: React.FC = () => {
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("013023666336");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="mt-16 mb-8 text-center border-t border-slate-200 pt-10">
        
        {/* Donation CTA */}
        <div className="mb-8">
           <button 
             onClick={() => setIsDonationOpen(true)}
             className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-rose-600 transition-all duration-200 bg-rose-50 rounded-full hover:bg-rose-100 hover:scale-105 hover:shadow-lg hover:shadow-rose-100 ring-1 ring-rose-200"
           >
             <Heart className="w-5 h-5 fill-rose-600 animate-pulse" />
             <span>Jom Menyumbang</span>
           </button>
           <p className="mt-2 text-xs text-slate-400">Sokong pembangunan & kos server AI ini</p>
        </div>

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

      {/* Donation Modal */}
      {isDonationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDonationOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100 animate-fade-in-up">
            <button 
              onClick={() => setIsDonationOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-4">
               <div className="bg-rose-100 p-3 rounded-full text-rose-600">
                 <Coffee size={32} />
               </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-1">Sumbangan Ikhlas</h3>
            <p className="text-sm text-slate-500 mb-6">Untuk kos operasi & penambahbaikan AI</p>

            {/* Bank Account Details */}
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-6 w-full shadow-inner relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>

               {/* Maybank Logo Representation */}
               <div className="h-14 mb-4 flex items-center justify-center bg-yellow-400 rounded-lg shadow-sm border border-yellow-500 mx-auto w-3/4">
                 <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Maybank_Logo.svg/1200px-Maybank_Logo.svg.png" 
                    alt="Maybank" 
                    className="h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<span class="font-bold text-slate-900 text-lg tracking-tight">Maybank</span>';
                    }}
                 />
               </div>

               {/* Account Number */}
               <div className="mb-3">
                 <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Nombor Akaun</p>
                 <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-mono font-bold text-slate-800 tracking-wider">0130 2366 6336</span>
                    <button 
                      onClick={handleCopyAccount}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Salin Nombor Akaun"
                    >
                      {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                 </div>
                 {copied && <span className="text-[10px] text-emerald-600 font-medium">Disalin!</span>}
               </div>

               {/* Account Name */}
               <div className="border-t border-amber-200/60 pt-2 mt-2">
                 <p className="text-sm font-semibold text-slate-800">Muhammad Syahmi Aminuddin</p>
               </div>
            </div>

            <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
              "Terima kasih kerana menyumbang untuk pembangunan AI ini."
            </p>
          </div>
        </div>
      )}
    </>
  );
};