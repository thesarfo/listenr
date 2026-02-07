
import React, { useState } from 'react';
import { View } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ExploreProps {
  onNavigate: (view: View) => void;
}

const Explore: React.FC<ExploreProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  
  const genres = ['Rock', 'Jazz', '2024 Releases', 'Electronic', 'Hip Hop', 'Pop', 'Classical', 'Soul'];

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setAiResponse(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a music discovery guru. A user is looking for music with this vibe: "${query}". Suggest 3 distinct albums with a brief 1-sentence explanation for each. Format nicely.`,
      });

      if (response.text) {
        setAiResponse(response.text);
      }
    } catch (error) {
      console.error("AI Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-16">
      {/* AI Discovery Bar */}
      <section className="space-y-6">
        <div className="bg-gradient-to-br from-primary/20 via-background-dark to-blue-500/10 p-8 rounded-3xl border border-primary/20 shadow-2xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
              Music Discovery Guru
              <span className="material-symbols-outlined text-primary animate-pulse">auto_awesome</span>
            </h2>
            <p className="text-slate-400 mb-6 font-medium">Describe a mood, a scene, or a specific sound and let Gemini find your next obsession.</p>
            
            <form onSubmit={handleAISearch} className="relative group">
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'Rainy night in a Tokyo jazz café' or 'Angry synth-pop for a long drive'"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-6 pr-32 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg placeholder:text-slate-600"
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-background-dark px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Explore'}
              </button>
            </form>

            {aiResponse && (
              <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4">
                <p className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Guru Recommendations</p>
                <div className="text-slate-300 prose prose-invert max-w-none whitespace-pre-line leading-relaxed italic">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="space-y-10">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <button className="bg-primary text-background-dark px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap shadow-lg shadow-primary/20">All Genres</button>
          {genres.map(genre => (
            <button key={genre} className="bg-white/5 hover:bg-white/10 px-6 py-2 rounded-full text-xs font-bold text-slate-400 hover:text-white transition-all whitespace-nowrap border border-white/10">
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 border-l-4 border-primary pl-4">Trending This Week</h2>
          <button className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1">
            See More <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              onClick={() => onNavigate('album-detail')}
              className="group cursor-pointer space-y-3"
            >
              <div className="aspect-square rounded-2xl bg-white/5 overflow-hidden shadow-2xl transition-all group-hover:scale-[1.03] group-hover:ring-2 ring-primary relative">
                <img src={`https://picsum.photos/seed/${i+400}/400/400`} className="w-full h-full object-cover" alt="Album cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                  <p className="font-black text-sm leading-tight text-white">{['Brat', 'Hit Me Hard', 'Midwest Princess', 'Cowboy Carter', 'Eternal Sunshine', 'TTPD'][i]}</p>
                  <p className="text-primary text-[10px] font-bold uppercase mt-1">Charli XCX</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular with Friends */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 border-l-4 border-primary pl-4">Popular with Friends</h2>
          <div className="flex gap-3">
            <button className="size-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <button className="size-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-4 group cursor-pointer" onClick={() => onNavigate('album-detail')}>
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white/5 transition-transform group-hover:scale-[1.02]">
                <img src={`https://picsum.photos/seed/${i+500}/400/400`} className="w-full h-full object-cover" alt="Popular album" />
                <div className="absolute top-3 left-3 flex -space-x-2">
                  {[...Array(i+1)].map((_, j) => (
                    <div key={j} className="size-7 rounded-full border-2 border-background-dark bg-slate-800 overflow-hidden shadow-lg">
                      <img src={`https://picsum.photos/seed/${j+600}/50/50`} alt="Friend avatar" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black truncate text-white">{['Vultures 1', 'WE DON\'T TRUST YOU', 'Diamond Jubilee', 'Bright Future', 'Only God Was Above Us'][i]}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Vampire Weekend</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Explore;
