import React, { useState } from 'react';
import { HadithResult } from '../types';
import { CheckCircle2, AlertCircle, XCircle, HelpCircle, Book, Link as LinkIcon, Share2, MessageCircle, Send, Copy, Check, FileText } from 'lucide-react';

interface ResultsCardProps {
  data: HadithResult;
  groundingUrls: { title: string; uri: string }[];
}

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('sahih')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (s.includes('hasan')) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (s.includes('daif') || s.includes('lemah')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (s.includes('palsu') || s.includes('maudhu')) return 'bg-red-100 text-red-800 border-red-200';
  return 'bg-slate-100 text-slate-800 border-slate-200';
};

const getStatusIcon = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('sahih')) return <CheckCircle2 size={18} />;
  if (s.includes('hasan')) return <CheckCircle2 size={18} />;
  if (s.includes('daif')) return <AlertCircle size={18} />;
  if (s.includes('palsu')) return <XCircle size={18} />;
  return <HelpCircle size={18} />;
};

export const ResultsCard: React.FC<ResultsCardProps> = ({ data, groundingUrls }) => {
  const [copied, setCopied] = useState(false);
  
  const shareText = `*Semakan Takhrij Hadis.my*%0A%0A*Status:* ${data.status}%0A*Matan:* ${data.matan.substring(0, 50)}...%0A*Terjemahan:* ${data.translation.substring(0, 100)}...%0A%0ASemak penuh di Takhrij Hadis.my`;

  const shareToWhatsapp = () => {
    window.open(`https://wa.me/?text=${shareText}`, '_blank');
  };

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=https://takrijhadis.my&text=${shareText}`, '_blank');
  };

  const handleCopy = () => {
    const textToCopy = `*Semakan Takhrij Hadis.my*\n\n*Status:* ${data.status}\n\n*Matan:* ${data.matan}\n\n*Terjemahan:* ${data.translation}\n\n*Sumber:* ${data.sources.join(', ')}\n\n*Huraian:* ${data.explanation}\n\n_Disemak pada: ${new Date().toLocaleDateString()}_`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in relative z-10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:shadow-emerald-500/10">
      {/* Status Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500">Status Hadis:</span>
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(data.status)}`}>
            {getStatusIcon(data.status)}
            {data.status}
          </span>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleCopy}
            className={`p-2 rounded-full transition-all flex items-center gap-2 ${copied ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
            title="Salin Teks"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied && <span className="text-xs font-semibold pr-1">Disalin!</span>}
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1 self-center"></div>
          <button 
            onClick={shareToWhatsapp}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
            title="Kongsi ke WhatsApp"
          >
            <MessageCircle size={18} />
          </button>
          <button 
            onClick={shareToTelegram}
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            title="Kongsi ke Telegram"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Matan (Arabic) */}
        <div className="space-y-4 text-center">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">Matan Hadis</h3>
          <p className="font-arabic text-2xl md:text-3xl leading-loose text-slate-800" dir="rtl">
            {data.matan}
          </p>
        </div>

        {/* Translation */}
        <div className="space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-100 relative">
          <div className="absolute -left-1 top-6 w-1 h-12 bg-emerald-500 rounded-r"></div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-2">
            <Book size={14} /> Terjemahan
          </h3>
          <p className="text-slate-700 leading-relaxed text-lg font-medium">
            {data.translation}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-1 gap-6">
          {/* Sources List */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
               <Book size={16} className="text-emerald-600" />
               Sumber Kitab Utama
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.sources.map((source, idx) => (
                <span key={idx} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm shadow-sm font-medium">
                  {source}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Explanation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
               <FileText size={16} className="text-emerald-600" />
               Huraian Status & Analisis Sanad
            </h3>
            <div className="text-sm text-slate-700 leading-7 bg-slate-50 p-5 rounded-lg border border-slate-100 whitespace-pre-line text-justify">
              {data.explanation}
            </div>
          </div>
        </div>
        
        {/* Grounding Sources (Actual Web Links) */}
        {groundingUrls.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase">Pautan Rujukan Web</h3>
            <ul className="space-y-2">
              {groundingUrls.map((url, idx) => (
                <li key={idx}>
                  <a 
                    href={url.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:underline truncate transition-colors group"
                  >
                    <LinkIcon size={14} className="group-hover:scale-110 transition-transform" />
                    {url.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 flex justify-center">
            <button onClick={shareToWhatsapp} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 font-medium">
                <Share2 size={18} />
                Sebarkan yang Sahih
            </button>
        </div>
      </div>
    </div>
  );
};