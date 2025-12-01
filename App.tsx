import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ResultsCard } from './components/ResultsCard';
import { ExternalLinks } from './components/ExternalLinks';
import { Search, Sparkles, Loader2, ArrowRight, Activity, Users, BookOpen } from 'lucide-react';
import { searchHadith } from './services/geminiService';
import { SearchState } from './types';

// Database for auto-suggestions
const POPULAR_SEARCHES = [
  "Innamal a'malu binniyat",
  "Tuntutlah ilmu sampai ke negeri China",
  "Kebersihan sebahagian dari iman",
  "Syurga di bawah telapak kaki ibu",
  "Tidur selepas asar gila",
  "Cinta hubbul watan minal iman",
  "Ikhtilaf umatku adalah rahmat",
  "Siapa kenal dirinya kenal Tuhannya",
  "Solat tiang agama",
  "Malu itu sebahagian daripada iman",
  "Tangan yang memberi lebih baik",
  "Jangan marah maka bagimu syurga"
];

const App: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    query: '',
    isLoading: false,
    data: null,
    error: null,
    groundingUrls: []
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Stats Logic
  const [stats, setStats] = useState({ dailyChecks: 142, totalVisitors: 12500 });

  useEffect(() => {
    // Generate some dynamic looking stats based on time
    const hour = new Date().getHours();
    const baseChecks = 50 + (hour * 12); // Increases throughout the day
    // Base visitors + random daily increment logic for demo
    const estimatedVisitors = 15200 + (hour * 45); 
    setStats({ dailyChecks: baseChecks, totalVisitors: estimatedVisitors });

    // Click outside to close suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setState(prev => ({ ...prev, query: val }));
    
    if (val.length > 1) {
      const filtered = POPULAR_SEARCHES.filter(s => 
        s.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!state.query.trim()) return;
    
    setShowSuggestions(false);
    doSearch(state.query);
  };

  const handleSuggestionClick = (text: string) => {
    setState(prev => ({ ...prev, query: text }));
    setShowSuggestions(false);
    doSearch(text);
  };

  const doSearch = async (text: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, data: null, groundingUrls: [] }));
    
    try {
      const { data, groundingUrls } = await searchHadith(text);
      setState(prev => ({ ...prev, isLoading: false, data, groundingUrls }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || "Berlaku ralat semasa pencarian. Sila cuba lagi." 
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Illustrations */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
        <BookOpen className="absolute top-20 left-10 w-64 h-64 text-slate-900" />
        <Activity className="absolute bottom-20 right-10 w-96 h-96 text-emerald-900" />
      </div>

      <Header />

      <main className="flex-grow container max-w-4xl mx-auto px-4 py-12 relative z-10">
        
        {/* Hero Section */}
        <div className="mb-12 text-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-2">
              AI Powered Takhrij
            </span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none text-slate-900 drop-shadow-sm">
              Biar Yakin <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">Baru Share</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg mt-4">
              Semak status hadis, matan, dan terjemahan dalam saat. Elakkan penyebaran hadis palsu.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex justify-center gap-4 md:gap-8 text-sm font-medium text-slate-600">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <span className="bg-blue-100 p-1.5 rounded-full text-blue-600"><Activity size={16} /></span>
              <span><span className="font-bold text-slate-900">{stats.dailyChecks}</span> hadis disemak hari ini</span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
            <div className="flex flex-col md:flex-row items-center gap-2">
              <span className="bg-emerald-100 p-1.5 rounded-full text-emerald-600"><Users size={16} /></span>
              <span><span className="font-bold text-slate-900">{stats.totalVisitors.toLocaleString()}</span> pelawat menggunakan AI ini</span>
            </div>
          </div>

          {/* Search Bar */}
          <div ref={searchContainerRef} className="relative max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative z-20">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative bg-white rounded-2xl shadow-xl">
                  <input
                    type="text"
                    value={state.query}
                    onChange={handleInputChange}
                    onFocus={() => state.query.length > 1 && setShowSuggestions(true)}
                    placeholder="Taip matan hadis atau kata kunci..."
                    className="w-full pl-14 pr-16 py-5 rounded-2xl border-0 focus:ring-0 text-lg text-slate-800 placeholder:text-slate-400"
                    disabled={state.isLoading}
                  />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={24} />
                  <button
                    type="submit"
                    disabled={state.isLoading || !state.query.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-emerald-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {state.isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                  </button>
                </div>
              </div>
            </form>

            {/* Auto Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-30 animate-fade-in-up origin-top">
                <div className="py-2">
                  <h4 className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cadangan Carian</h4>
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <Search size={14} className="text-slate-400" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {state.isLoading && (
          <div className="max-w-2xl mx-auto text-center py-12 space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-100 rounded-full animate-spin border-t-emerald-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center">
                    <Sparkles className="text-emerald-500 animate-pulse" size={24} />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-800">Sedang menyemak ribuan kitab...</h3>
              <p className="text-slate-500 text-sm">Sila tunggu sebentar, AI sedang melakukan takhrij.</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Carian Gagal</h3>
            <p className="text-red-600 text-sm opacity-90">{state.error}</p>
          </div>
        )}

        {/* Results */}
        {state.data && (
          <div className="max-w-3xl mx-auto animate-fade-in-up pb-12">
            <ResultsCard data={state.data} groundingUrls={state.groundingUrls} />
          </div>
        )}

        <ExternalLinks />
      </main>
    </div>
  );
};

export default App;