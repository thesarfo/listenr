import React, { useState, useEffect, useCallback } from 'react';
import { View, NavigateFn } from '../types';
import { albums } from '../api/client';
import { getAlbumCoverUrl } from '../utils/albumCover';

interface AlbumBrief {
  id: string;
  title?: string;
  artist?: string;
  cover_url?: string;
  year?: number;
}

interface LogAlbumProps {
  onNavigate: NavigateFn;
}

const LogAlbum: React.FC<LogAlbumProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AlbumBrief[]>([]);
  const [browse, setBrowse] = useState<AlbumBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const loadBrowse = useCallback(() => {
    setLoading(true);
    albums.list(24, 0).then((r) => setResults((r.data as AlbumBrief[]) || [])).catch(() => setResults([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadBrowse();
  }, [loadBrowse]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      loadBrowse();
      return;
    }
    setSearching(true);
    try {
      const r = await albums.search(q, 24, 0);
      setResults((r.data as AlbumBrief[]) || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const displayList = results;

  return (
    <div className="min-h-screen flex flex-col bg-background-dark">
      <header className="sticky top-0 z-50 bg-background-dark/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Back
          </button>
          <h1 className="text-lg font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">library_music</span>
            Log Album
          </h1>
        </div>
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto mt-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search albums by title or artist..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-background-dark px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <p className="text-slate-500 text-sm mb-6">
          {query.trim() ? 'Select an album to log' : 'Browse or search for an album to log'}
        </p>

        {loading || searching ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4 block">album</span>
            <p className="text-slate-500 mb-2">No albums found</p>
            <p className="text-slate-600 text-sm">Try a different search or run the seed script to add albums.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {displayList.map((a, i) => (
              <button
                key={a.id}
                onClick={() => onNavigate('write-review', a.id)}
                className="group text-left space-y-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl"
              >
                <div className="aspect-square rounded-2xl bg-white/5 overflow-hidden shadow-xl transition-all group-hover:scale-[1.03] group-hover:ring-2 ring-primary group-focus:ring-2 group-focus:ring-primary">
                  <img
                    src={getAlbumCoverUrl(a.cover_url, a.title, a.artist)}
                    className="w-full h-full object-cover"
                    alt={a.title || 'Album'}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate text-white group-hover:text-primary transition-colors">{a.title || 'Album'}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{a.artist || ''}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LogAlbum;
