import React, { useState } from 'react';
import { Album } from '../types';
import { albums, users } from '../api/client';
import { getAlbumCoverUrl } from '../utils/albumCover';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [selectedAlbums, setSelectedAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Album[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await albums.search(searchQuery, 10);
      setSearchResults(
        (res.data || []).map((a: { id: string; title?: string; artist?: string; year?: number; cover_url?: string; genres?: string[] }) => ({
          id: a.id,
          title: a.title || '',
          artist: a.artist || '',
          year: a.year || 0,
          coverUrl: a.cover_url || '',
          genre: a.genres,
        }))
      );
    } catch (e) {
      console.error('Search failed:', e);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addAlbum = (album: Album) => {
    if (selectedAlbums.length >= 5) return;
    if (selectedAlbums.some((a) => a.id === album.id)) return;
    setSelectedAlbums([...selectedAlbums, album]);
  };

  const removeAlbum = (id: string) => {
    setSelectedAlbums(selectedAlbums.filter((a) => a.id !== id));
  };

  const handleComplete = async () => {
    try {
      await users.updateFavorites(selectedAlbums.map((a) => a.id));
    } catch (e) {
      console.error('Save favorites failed:', e);
    }
    onComplete();
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-white/10 px-6 md:px-20 py-4 sticky top-0 bg-background-dark/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
            <span className="material-symbols-outlined font-bold">album</span>
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase">Listenr</h2>
        </div>
        <button onClick={onComplete} className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-full h-10 px-6 border border-white/10 text-sm font-bold hover:bg-white/5 transition-all">
          Skip
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start pt-12 pb-20 px-6">
        <div className="max-w-[800px] w-full text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white">
              Set the Stage<span className="text-primary">.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-xl mx-auto">
              Pick your all-time favorites to build your profile.
            </p>
          </div>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/10" />
            <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-widest text-slate-500">Manually curate</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Search to add 3-5 favorite albums</h2>
            <div className="relative group flex gap-2">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <input
                className="flex-1 h-16 bg-white/5 border-none rounded-2xl pl-12 pr-6 text-lg focus:ring-2 focus:ring-primary/20 placeholder:text-slate-600 transition-all"
                placeholder="Search by album title or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} disabled={searching} className="bg-primary text-background-dark px-6 h-16 rounded-2xl font-bold disabled:opacity-50">
                {searching ? '...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="flex flex-wrap gap-4 justify-center">
                {searchResults.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => addAlbum(album)}
                    className="flex flex-col items-center w-28 group"
                  >
                    <div className="aspect-square w-full rounded-xl bg-white/5 overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
                      <img className="w-full h-full object-cover" src={getAlbumCoverUrl(album.coverUrl, album.title, album.artist)} alt={album.title} />
                    </div>
                    <p className="text-sm font-bold truncate w-full mt-2">{album.title}</p>
                    <p className="text-xs text-slate-500 truncate w-full">{album.artist}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="album-scroll flex gap-4 overflow-x-auto py-4 px-2 snap-x">
              {selectedAlbums.map((album) => (
                <div key={album.id} className="flex-shrink-0 w-36 snap-center group relative cursor-pointer">
                  <div className="aspect-square w-full rounded-xl bg-surface-dark overflow-hidden border-2 border-primary shadow-2xl shadow-primary/10 transition-transform hover:scale-105">
                    <img className="w-full h-full object-cover" src={getAlbumCoverUrl(album.coverUrl, album.title, album.artist)} alt={album.title} />
                    <div onClick={() => removeAlbum(album.id)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <div className="aspect-square w-full rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-white/20">add</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/20">Slot {selectedAlbums.length + i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <button onClick={handleComplete} className="w-full md:w-auto min-w-[280px] flex items-center justify-center gap-2 bg-primary text-background-dark h-16 rounded-full text-lg font-black tracking-tight hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 active:scale-95 transition-all">
              <span>Continue to Profile</span>
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
