
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface WriteReviewProps {
  onCancel: () => void;
  onPost: () => void;
}

const WriteReview: React.FC<WriteReviewProps> = ({ onCancel, onPost }) => {
  const [rating, setRating] = useState(4.5);
  const [content, setContent] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  const polishWithAI = async () => {
    if (!content.trim()) return;
    
    setIsPolishing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a world-class music critic. Transform these rough notes into a polished, insightful, and slightly poetic album review for a platform like Letterboxd. Keep it around 100 words. Rough notes: "${content}"`,
      });

      if (response.text) {
        setContent(response.text.trim());
      }
    } catch (error) {
      console.error("AI Polish failed:", error);
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-background-dark">
      <header className="w-full max-w-5xl px-6 py-6 flex items-center justify-between sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md">
        <button 
          onClick={onCancel}
          className="text-[#92c9a4] hover:text-white transition-colors text-sm font-bold tracking-widest uppercase"
        >
          Cancel
        </button>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
          <h1 className="text-sm font-bold uppercase tracking-[0.3em]">Log Entry</h1>
        </div>
        <button 
          onClick={onPost}
          className="bg-primary hover:bg-primary/90 text-background-dark px-8 py-2.5 rounded-xl font-black text-sm transition-all transform active:scale-95 shadow-lg shadow-primary/20"
        >
          Post
        </button>
      </header>

      <main className="w-full max-w-3xl px-6 py-12 flex flex-col items-center gap-12">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="relative group">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-[#193322] border border-white/10 ring-1 ring-white/5">
              <img 
                alt="Album Cover" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQaU-iSDMJn7SCflZvUgbfkhRnvl41xmxOFn6icv69J_HDXld-w_6jCYDOXVxjqqOiugOu6zEU7VImOpCVzpugutuO3eYPY6EElmttMuHhNy4CPmYorgT73j6Vp-5mDdoT2tRQ7hx0v1vI8OjsD3I_JuP05hB9au8oFfSunn6oXU050Cv2nVjV_ool3txhIujKlHWPw0OIHhqffC0chEA2HFjyOcf-VxFYlJye0HLlpPoX1xsn8RSrSzn0Oa30j2czaf3uKK-DHy8" 
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Currents</h2>
            <p className="text-primary text-lg font-bold tracking-widest uppercase">Tame Impala</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setRating(i + 1)}
                className="transition-transform active:scale-90"
              >
                <span 
                  className={`material-symbols-outlined text-5xl md:text-6xl cursor-pointer ${rating >= i + 1 ? 'text-primary fill-1' : 'text-white/10'}`}
                >
                  star
                </span>
              </button>
            ))}
          </div>
          <p className="text-primary text-xs font-black uppercase tracking-[0.3em]">{rating.toFixed(1)} Stars</p>
        </div>

        <div className="w-full relative group">
          <textarea 
            className="w-full bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-body-serif italic text-white/90 placeholder:text-white/10 min-h-[300px] leading-relaxed resize-none" 
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button 
            onClick={polishWithAI}
            disabled={isPolishing || !content.trim()}
            className={`absolute right-0 bottom-4 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isPolishing ? 'border-primary bg-primary/20 text-primary animate-pulse' : 'border-white/10 bg-white/5 text-[#92c9a4] hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined text-sm">{isPolishing ? 'auto_fix_high' : 'magic_button'}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{isPolishing ? 'Polishing...' : 'AI Magic'}</span>
          </button>
        </div>

        <div className="w-full flex flex-col gap-8 pt-12 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[#92c9a4] text-xs font-black uppercase tracking-widest mr-2">Tags</span>
            <button className="flex items-center gap-2 bg-primary text-background-dark px-5 py-2 rounded-full text-xs font-black transition-all">
              <span className="material-symbols-outlined text-sm font-black">check</span>
              First Listen
            </button>
            {['Classic', 'Physical Media', 'Deep Dive'].map(tag => (
              <button key={tag} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2 rounded-full text-xs font-black transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
                {tag}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-8 text-[#92c9a4]">
            <div className="flex items-center gap-10">
              <button className="flex items-center gap-3 hover:text-white transition-colors group">
                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">calendar_today</span>
                <span className="text-xs font-black uppercase tracking-widest">Oct 24, 2024</span>
              </button>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-5 bg-primary rounded-full relative transition-all shadow-[0_0_10px_rgba(19,236,91,0.3)]">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-background-dark rounded-full"></div>
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Share to Feed</span>
              </div>
            </div>
            <div className="text-[10px] font-mono opacity-40 uppercase tracking-[0.2em] font-bold">
              Draft saved 2m ago
            </div>
          </div>
        </div>
      </main>
      
      <div className="fixed bottom-0 left-0 w-full h-64 bg-gradient-to-t from-background-dark to-transparent pointer-events-none -z-10"></div>
    </div>
  );
};

export default WriteReview;
