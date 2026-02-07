
import React, { useEffect, useState } from 'react';
import { View } from '../types';
import { MOCK_ALBUMS } from '../mockData';
import { GoogleGenAI } from "@google/genai";

interface AlbumDetailProps {
  onBack: () => void;
  onReview: () => void;
}

const AlbumDetail: React.FC<AlbumDetailProps> = ({ onBack, onReview }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const album = MOCK_ALBUMS[1]; // To Pimp A Butterfly

  useEffect(() => {
    const fetchAIInsight = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Provide a 2-sentence "vibe check" for the album "${album.title}" by ${album.artist}. Focus on the emotional landscape and why it's considered essential listening.`,
        });
        if (response.text) {
          setAiInsight(response.text.trim());
        }
      } catch (err) {
        console.error("Failed to fetch AI insight:", err);
      }
    };
    fetchAIInsight();
  }, [album]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-12">
      <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-end">
        <div className="w-64 h-64 md:w-80 md:h-80 shrink-0 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 ring-1 ring-white/5 transform hover:scale-[1.02] transition-transform">
          <img src={album.coverUrl} className="w-full h-full object-cover" alt={album.title} />
        </div>
        
        <div className="flex-1 text-center lg:text-left space-y-4">
          <div className="space-y-1">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">Album</span>
            <p className="text-slate-500 text-sm font-bold mt-2">Released March 15, 2015</p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{album.title}</h1>
            <p className="text-2xl md:text-3xl text-primary font-bold italic">{album.artist}</p>
          </div>
          
          <div className="flex justify-center lg:justify-start gap-12 pt-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Avg Rating</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black">4.9</span>
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined fill-1">star</span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Logs</p>
              <p className="text-3xl font-black">1.2M</p>
            </div>
          </div>
        </div>
      </div>

      {aiInsight && (
        <div className="p-8 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary rounded-r-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            AI Perspective
          </p>
          <p className="text-xl md:text-2xl font-body-serif italic text-white/90 leading-relaxed">
            "{aiInsight}"
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 max-w-fit mx-auto lg:mx-0">
        <button 
          onClick={onReview}
          className="bg-primary text-background-dark px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined font-black">add_circle</span>
          Log Album
        </button>
        <button className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2 border border-white/5">
          <span className="material-symbols-outlined">star</span>
          Rate
        </button>
        <button className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2 border border-white/5">
          <span className="material-symbols-outlined">reviews</span>
          Review
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center justify-between">
              Tracklist
              <span className="text-slate-600 lowercase font-medium tracking-normal italic">16 tracks • 78 min 51 sec</span>
            </h2>
            <div className="divide-y divide-white/5 border-y border-white/5">
              {[
                { n: '01', t: "Wesley's Theory", d: '4:47' },
                { n: '02', t: 'For Free? (Interlude)', d: '2:10' },
                { n: '03', t: 'King Kunta', d: '3:54' },
                { n: '04', t: 'Institutionalized', d: '4:31' },
                { n: '05', t: 'These Walls', d: '5:01' }
              ].map(track => (
                <div key={track.n} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-white/5 px-2 transition-colors rounded-lg">
                  <div className="flex items-center gap-6">
                    <span className="text-slate-600 font-mono text-xs">{track.n}</span>
                    <p className="font-bold group-hover:text-primary transition-colors">{track.t}</p>
                  </div>
                  <span className="text-slate-600 font-mono text-xs">{track.d}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center justify-between">
              Popular Reviews
              <button className="text-primary hover:underline text-[10px] font-black tracking-widest uppercase">View All</button>
            </h2>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-slate-800" />
                      <p className="text-sm font-bold">User_{i+1}</p>
                      <div className="flex text-primary text-xs">
                        {[...Array(5)].map((_, j) => <span key={j} className="material-symbols-outlined text-[14px] fill-1">star</span>)}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">2 days ago</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    A sprawl, complex masterpiece that rewards every single listen. The fusion of jazz, funk, and spoken word is unlike anything else in hip-hop. This isn't just an album; it's a historical document.
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <div className="bg-card-dark p-8 rounded-2xl border border-white/5 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Ratings Distribution</h3>
            <div className="space-y-3">
              {[68, 21, 7, 3, 1].map((pct, i) => (
                <div key={i} className="flex items-center gap-4 text-[10px] font-bold">
                  <span className="text-slate-500 w-2">{5 - i}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-slate-500 w-8 text-right">{pct}%</span>
                </div>
              ))}
            </div>

            <div className="pt-6 space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {album.genre?.map(g => (
                    <span key={g} className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-slate-300 border border-white/10">{g}</span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Label</p>
                  <p className="text-xs font-bold">Aftermath / Interscope</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Length</p>
                  <p className="text-xs font-bold">78:51</p>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between items-center border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stream it on</p>
              <div className="flex gap-4">
                {['podcasts', 'music_note', 'headphones'].map(icon => (
                  <span key={icon} className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors cursor-pointer text-xl">{icon}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;
