
import React from 'react';
import { View } from '../types';
import { MOCK_ALBUMS } from '../mockData';

interface DiaryProps {
  onNavigate: (view: View) => void;
}

const Diary: React.FC<DiaryProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-[960px] mx-auto py-12 px-6">
      <div className="flex flex-wrap justify-between items-end gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter">Listening Diary</h1>
          <p className="text-primary/70 text-lg font-bold">128 albums logged in 2024</p>
        </div>
        <button className="flex items-center gap-3 rounded-2xl h-12 px-8 bg-primary text-background-dark text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-xl">file_download</span>
          <span>Export Data</span>
        </button>
      </div>

      <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {['Month: October', 'Rating: 4+ Stars', 'Format: Vinyl'].map(filter => (
          <button key={filter} className="flex h-12 shrink-0 items-center gap-3 rounded-xl bg-white/5 px-6 border border-white/10 hover:border-primary/50 transition-all group">
            <span className="text-xs font-bold uppercase tracking-widest">{filter}</span>
            <span className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform">expand_more</span>
          </button>
        ))}
        <button className="ml-auto text-slate-500 hover:text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
          <span className="material-symbols-outlined text-sm">restart_alt</span>
          Clear
        </button>
      </div>

      <div className="relative space-y-0">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-white/10"></div>
        
        <div className="pb-10">
          <div className="relative pl-12 py-6 mb-8 flex items-center">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-primary/30"></div>
            <span className="text-primary/50 text-[10px] font-black uppercase tracking-[0.3em]">October 2024</span>
          </div>

          {[...Array(4)].map((_, i) => (
            <div key={i} className="relative pl-12 pb-12 group last:pb-0">
              <div className="absolute left-[11px] top-4 size-3 rounded-full bg-primary ring-4 ring-background-dark z-10 shadow-[0_0_15px_#13ec5b] group-hover:scale-125 transition-transform"></div>
              
              <div 
                onClick={() => onNavigate('album-detail')}
                className="flex flex-col md:flex-row md:items-center gap-6 bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-primary/40 transition-all cursor-pointer group-hover:translate-x-1"
              >
                <div className="w-16 md:w-24 text-slate-500 font-black text-[10px] uppercase tracking-widest shrink-0">{24-i} Oct</div>
                <div className="flex flex-1 items-center gap-6 min-w-0">
                  <div className="size-16 md:size-20 rounded-xl bg-slate-800 bg-cover shrink-0 shadow-2xl" style={{ backgroundImage: `url('https://picsum.photos/seed/${i+200}/300/300')` }} />
                  <div className="min-w-0">
                    <h3 className="font-black text-lg md:text-xl truncate group-hover:text-primary transition-colors">{i === 0 ? 'Ziggy Stardust' : i === 1 ? 'Madvillainy' : 'Blue' }</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">David Bowie • <span className="text-primary/70">Vinyl</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary pt-2 md:pt-0">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className={`material-symbols-outlined text-[20px] ${j < (5-i/2) ? 'fill-1' : ''}`}>
                      {j < (5-i/2) ? 'star' : 'star_outline'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Diary;
