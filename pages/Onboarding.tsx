
import React, { useState } from 'react';
import { Album } from '../types';
import { MOCK_ALBUMS } from '../mockData';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [selectedAlbums, setSelectedAlbums] = useState<Album[]>([MOCK_ALBUMS[0], MOCK_ALBUMS[1]]);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-white/10 px-6 md:px-20 py-4 sticky top-0 bg-background-dark/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
            <span className="material-symbols-outlined font-bold">album</span>
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase">DiscogLog</h2>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden md:block text-slate-500 text-xs font-bold uppercase tracking-widest">Step 1 of 8</span>
          <button 
            onClick={onComplete}
            className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-full h-10 px-6 border border-white/10 text-sm font-bold hover:bg-white/5 transition-all"
          >
            Skip
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start pt-12 pb-20 px-6">
        <div className="max-w-[800px] w-full text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white">
              Set the Stage<span className="text-primary">.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-xl mx-auto">
              Sync your library and pick your all-time favorites to build your profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all group text-left">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-[#1DB954] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl fill-1">podcasts</span>
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">Connect Spotify</p>
                  <p className="text-sm text-slate-500">Sync history & playlists</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">chevron_right</span>
            </button>
            <button className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all group text-left">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl">music_note</span>
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">Connect Apple Music</p>
                  <p className="text-sm text-slate-500">Import your library</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">chevron_right</span>
            </button>
          </div>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-widest text-slate-500">Or manually curate</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Search to add 3-5 favorite albums</h2>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full h-16 bg-white/5 border-none rounded-2xl pl-12 pr-6 text-lg focus:ring-2 focus:ring-primary/20 placeholder:text-slate-600 transition-all" 
                placeholder="Search by album title, artist, or year..." 
                type="text"
              />
            </div>

            <div className="album-scroll flex gap-4 overflow-x-auto py-4 px-2 snap-x">
              {selectedAlbums.map((album) => (
                <div key={album.id} className="flex-shrink-0 w-36 snap-center group relative cursor-pointer">
                  <div className="aspect-square w-full rounded-xl bg-surface-dark overflow-hidden border-2 border-primary shadow-2xl shadow-primary/10 transition-transform hover:scale-105">
                    <img className="w-full h-full object-cover" src={album.coverUrl} alt={album.title} />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-3xl">close</span>
                    </div>
                  </div>
                  <div className="mt-3 text-left">
                    <p className="text-sm font-bold truncate">{album.title}</p>
                    <p className="text-xs text-slate-500 truncate">{album.artist}</p>
                  </div>
                </div>
              ))}
              {[...Array(5 - selectedAlbums.length)].map((_, i) => (
                <div key={`empty-${i}`} className="flex-shrink-0 w-36 snap-center">
                  <div className={`aspect-square w-full rounded-xl bg-white/5 border-2 border-dashed ${i === 0 ? 'border-primary/30 group hover:border-primary/50 text-primary/40' : 'border-white/10 text-white/10'} flex flex-col items-center justify-center gap-2 cursor-pointer transition-all`}>
                    <span className="material-symbols-outlined text-3xl">add</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Slot {selectedAlbums.length + i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <button 
              onClick={onComplete}
              className="w-full md:w-auto min-w-[280px] flex items-center justify-center gap-2 bg-primary text-background-dark h-16 rounded-full text-lg font-black tracking-tight hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 active:scale-95 transition-all"
            >
              <span>Continue to Profile</span>
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </button>
            <p className="mt-4 text-xs text-slate-500 font-medium">You can always change your favorites later.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
