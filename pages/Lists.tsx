
import React from 'react';
import { View } from '../types';

interface ListsProps {
  onNavigate: (view: View) => void;
}

const Lists: React.FC<ListsProps> = ({ onNavigate }) => {
  const lists = [
    { title: '2025 Favorites', albums: 42, likes: '1.2k', img: 'https://picsum.photos/seed/list1/400/400' },
    { title: 'Late Night Jazz', albums: 18, likes: '450', img: 'https://picsum.photos/seed/list2/400/400' },
    { title: 'Perfect Production', albums: 12, likes: '89', img: 'https://picsum.photos/seed/list3/400/400' },
    { title: 'To Listen', albums: 5, likes: '12', img: 'https://picsum.photos/seed/list4/400/400' },
    { title: 'Sunday Soul', albums: 34, likes: '892', img: 'https://picsum.photos/seed/list5/400/400' },
    { title: 'Workout Loud', albums: 21, likes: '102', img: 'https://picsum.photos/seed/list6/400/400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-16 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <nav className="flex gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <span>Profile</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-500">Collections</span>
          </nav>
          <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter">My Lists</h2>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-white/10">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-white/10">
            <span className="material-symbols-outlined text-lg">sort</span>
            Recent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
        {lists.map((list, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="relative h-64 mb-6">
              {/* Stack effect */}
              <div className="absolute inset-0 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden translate-x-4 -translate-y-4 opacity-30 scale-90 transition-transform group-hover:translate-x-6 group-hover:-translate-y-6">
                <img src={`https://picsum.photos/seed/${i+1000}/400/400`} className="w-full h-full object-cover grayscale" alt="stack" />
              </div>
              <div className="absolute inset-0 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden translate-x-2 -translate-y-2 opacity-60 scale-95 border border-white/5 transition-transform group-hover:translate-x-3 group-hover:-translate-y-3">
                <img src={`https://picsum.photos/seed/${i+1100}/400/400`} className="w-full h-full object-cover grayscale" alt="stack" />
              </div>
              <div className="absolute inset-0 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 group-hover:scale-[1.02] transition-all">
                <img src={list.img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={list.title} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </div>
            </div>
            
            <h3 className="text-2xl font-serif font-bold group-hover:text-primary transition-colors mb-2">{list.title}</h3>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">album</span>{list.albums} albums</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base text-rose-500 fill-1">favorite</span>{list.likes} likes</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-10 right-10 z-50">
        <button className="flex items-center gap-3 bg-primary text-background-dark px-8 py-5 rounded-full font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(19,236,91,0.3)] hover:scale-110 active:scale-95 transition-all group">
          <span className="material-symbols-outlined text-2xl font-black group-hover:rotate-90 transition-transform">add</span>
          <span>Create New List</span>
        </button>
      </div>
    </div>
  );
};

export default Lists;
