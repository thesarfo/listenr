
import React from 'react';
import { View, Review } from '../types';
import { MOCK_REVIEWS } from '../mockData';

interface HomeProps {
  onNavigate: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
      {/* Feed Column */}
      <div className="flex-1 space-y-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black">Social Activity</h2>
            <p className="text-slate-500 text-sm">Latest logs from people you follow</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl text-xs font-bold uppercase tracking-wider">
            <button className="px-6 py-2 rounded-lg bg-white/10 shadow-sm text-primary">All</button>
            <button className="px-6 py-2 rounded-lg text-slate-500 hover:text-white transition-colors">Reviews</button>
          </div>
        </div>

        {MOCK_REVIEWS.map((review) => (
          <div 
            key={review.id} 
            className="bg-card-dark rounded-2xl border border-white/5 p-6 flex gap-6 hover:border-primary/20 transition-all group cursor-pointer"
            onClick={() => onNavigate('album-detail')}
          >
            <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/5 relative group">
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-4xl">play_arrow</span>
              </div>
              <img src={review.albumCover} className="w-full h-full object-cover" alt={review.albumTitle} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-cover bg-center border border-white/10" style={{ backgroundImage: `url(${review.userAvatar})` }}></div>
                  <p className="text-sm">
                    <span className="font-bold text-white">{review.userName}</span>
                    <span className="text-slate-500 ml-1">reviewed</span>
                    <span className="text-white font-bold ml-1">{review.albumTitle}</span>
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{review.timestamp}</span>
              </div>
              
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`material-symbols-outlined text-primary text-[18px] ${i < Math.floor(review.rating) ? 'fill-1' : ''}`}>
                    {i < Math.floor(review.rating) ? 'star' : review.rating % 1 !== 0 && i === Math.floor(review.rating) ? 'star_half' : 'star'}
                  </span>
                ))}
                <span className="ml-2 text-xs font-black text-primary">{review.rating.toFixed(1)}</span>
              </div>
              
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6">
                {review.content}
              </p>
              
              <div className="flex items-center gap-8">
                <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[22px]">favorite</span>
                  <span className="text-xs font-bold">{review.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
                  <span className="text-xs font-bold">{review.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-[22px]">share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Sidebar */}
      <aside className="w-full lg:w-80 space-y-8">
        <div className="bg-card-dark rounded-2xl border border-white/5 p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center justify-between">
            Trending Albums
            <span className="material-symbols-outlined text-sm text-primary">trending_up</span>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                onClick={() => onNavigate('album-detail')}
                className="aspect-square rounded-lg bg-white/5 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all shadow-lg"
              >
                <img src={`https://picsum.photos/seed/${i+100}/300/300`} className="w-full h-full object-cover" alt="Trending album" />
              </div>
            ))}
          </div>
          <button className="w-full mt-6 text-center text-xs font-black text-primary hover:underline transition-all">
            View full charts
          </button>
        </div>

        <div className="bg-card-dark rounded-2xl border border-white/5 p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Recommended for you</h3>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-white/5 overflow-hidden border border-white/10">
                  <img src={`https://picsum.photos/seed/${i+50}/100/100`} alt="Recommended user" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-white">{i === 0 ? 'Vinyl_Junkie' : 'IndieKid_99'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{i === 0 ? 'Followed by Alex' : '45 reviews this week'}</p>
                </div>
                <button className="text-[10px] font-black uppercase bg-primary/10 text-primary px-4 py-2 rounded-full hover:bg-primary hover:text-background-dark transition-all">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-2 text-[10px] text-slate-600 font-bold space-x-4 uppercase tracking-widest">
          <a className="hover:text-primary" href="#">About</a>
          <a className="hover:text-primary" href="#">Apps</a>
          <a className="hover:text-primary" href="#">Privacy</a>
          <p className="mt-4 normal-case text-[11px] font-medium opacity-50">© 2024 MusicBoxd. All rights reserved.</p>
        </div>
      </aside>
    </div>
  );
};

export default Home;
