
import React from 'react';
import { View } from '../types';
import { MOCK_ALBUMS } from '../mockData';

interface ProfileProps {
  onNavigate: (view: View) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-[1000px] mx-auto py-12 px-6">
      {/* Profile Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
        <div 
          className="size-40 md:size-48 bg-center bg-cover rounded-3xl shadow-2xl ring-4 ring-primary/10 transition-transform hover:scale-105" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKlD60L06GtWbUd1ljOXhCTasqCPsIMeJlGUOTrCH__zaqRY6snCru5-RJWF0q_tkCAtToIQ7ECfvTyo3xIky-KKO89a3AvOlZYQTXHkVjO-s8zhSEJ0zSkYbpC_mbA9jCK7ISh-rzYCc377nU92OHnzTrmL22Pmw6jppFRLIqKvQS1_U4oc-HWpa-fkCBEVdu3_GYyMBfH2eU6XRbgcYeQDyXW_18NcosLn9gxFFYxzIPmlwUqmCgOEKVdVinTq9mVQY-9qjYz0M')" }} 
        />
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">music_connoisseur</h1>
            <button className="bg-primary text-black px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all self-center md:self-auto shadow-lg shadow-primary/20">
              Follow
            </button>
          </div>
          <p className="text-slate-400 text-lg font-medium max-w-xl">
            Dedicated crate digger. Exploring Japanese jazz fusion, 70s soul, and early synth-pop experimentation. Vinyl only where possible.
          </p>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12">
        {[
          { label: 'Albums', value: '1,248' },
          { label: 'Reviews', value: '452' },
          { label: 'Lists', value: '36' }
        ].map(stat => (
          <div key={stat.label} className="bg-white/5 border border-white/5 rounded-2xl p-6 group hover:border-primary/30 transition-all">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">{stat.label}</p>
            <p className="text-3xl md:text-4xl font-black tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Favorite Albums Section */}
      <div className="mt-20 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Favorite Albums</h3>
          <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Edit Selection</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {MOCK_ALBUMS.concat(MOCK_ALBUMS[0]).map((album, i) => (
            <div 
              key={`${album.id}-${i}`} 
              onClick={() => onNavigate('album-detail')}
              className="group cursor-pointer space-y-4"
            >
              <div className="aspect-square bg-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:-translate-y-2 group-hover:ring-4 ring-primary/50 relative">
                <img src={album.coverUrl} className="w-full h-full object-cover" alt={album.title} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-4xl">visibility</span>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 text-center">
                <p className="text-sm font-black truncate">{album.title}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">{album.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-20 border-b border-white/10 flex gap-10 overflow-x-auto scrollbar-hide">
        {['Diary', 'Reviews', 'Lists', 'Following'].map((tab, i) => (
          <button 
            key={tab} 
            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${i === 0 ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-12 space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-6 items-start p-6 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
            <div className="w-20 md:w-24 shrink-0 aspect-square bg-white/5 rounded-xl overflow-hidden shadow-lg">
              <img src={`https://picsum.photos/seed/${i+30}/200/200`} alt="Recent activity" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-black">{i === 0 ? 'Bitches Brew' : i === 1 ? 'Long Season' : 'The New Abnormal'}</h4>
                <div className="flex text-primary">
                  {[...Array(5)].map((_, j) => <span key={j} className="material-symbols-outlined text-sm fill-1">star</span>)}
                </div>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Logged on Oct {24-i}, 2024</p>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 italic">
                A masterpiece that sounds as futuristic today as it did when it first dropped. Absolute essentials for any jazz collection.
              </p>
            </div>
          </div>
        ))}
        <div className="pt-10 flex justify-center">
          <button 
            onClick={() => onNavigate('diary')}
            className="px-10 py-4 rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
          >
            View Full Diary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
