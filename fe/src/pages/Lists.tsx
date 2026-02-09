import React, { useEffect, useState } from 'react';
import { NavigateFn } from '../types';
import { lists } from '../api/client';
import { ApiList } from '../api/client';
import { getAlbumCoverUrl } from '../utils/albumCover';
import LoadingSpinner from '../components/LoadingSpinner';

function ListCover({ list }: { list: ApiList }) {
  const preview = list.preview_albums ?? [];
  if (preview.length === 1) {
    const a = preview[0];
    return (
      <img
        src={getAlbumCoverUrl(a.cover_url, a.title, a.artist)}
        className="w-full h-full object-cover transition-transform group-hover:scale-110"
        alt={list.title}
      />
    );
  }
  if (preview.length >= 2) {
    return (
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 md:gap-1">
        {[0, 1, 2, 3].map((i) => {
          const a = preview[i];
          if (!a) return <div key={i} className="bg-slate-800" aria-hidden />;
          return (
            <img
              key={a.id}
              src={getAlbumCoverUrl(a.cover_url, a.title, a.artist)}
              alt=""
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          );
        })}
      </div>
    );
  }
  return (
    <img
      src={getAlbumCoverUrl(list.cover_url, list.title, undefined)}
      className="w-full h-full object-cover transition-transform group-hover:scale-110"
      alt={list.title}
    />
  );
}

interface ListsProps {
  onNavigate: NavigateFn;
}

const Lists: React.FC<ListsProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<ApiList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = async (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/l/${listId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(listId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  useEffect(() => {
    lists.list().then((d) => {
      setItems((d || []) as ApiList[]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!createTitle.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const list = await lists.create({ title: createTitle.trim(), description: createDesc.trim() || undefined });
      setItems((prev) => [list, ...prev]);
      setShowCreate(false);
      setCreateTitle('');
      setCreateDesc('');
      onNavigate('list-detail', undefined, undefined, list.id);
    } catch (e) {
      setError((e as Error).message || 'Failed to create list');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-10 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <nav className="flex gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <span>Profile</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-500">Collections</span>
          </nav>
          <h2 className="text-2xl md:text-4xl font-serif font-bold tracking-tight">My Lists</h2>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-slate-500 py-8 text-sm">No lists yet. Create your first collection.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((list) => (
            <div
              key={list.id}
              onClick={() => onNavigate('list-detail', undefined, undefined, list.id)}
              className="group cursor-pointer"
            >
              <div className="relative h-44 md:h-48 mb-4">
                <div className="absolute inset-0 bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-white/10">
                  <ListCover list={list} />
                </div>
                <button
                  type="button"
                  onClick={(e) => handleShare(e, list.id)}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-primary text-white opacity-0 group-hover:opacity-100 transition-all"
                  title="Share list"
                >
                  <span className="material-symbols-outlined text-lg">{copiedId === list.id ? 'check' : 'share'}</span>
                </button>
              </div>
              <h3 className="text-2xl font-serif font-bold group-hover:text-primary transition-colors mb-2">{list.title}</h3>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">album</span>
                  {list.albums_count} albums
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-rose-500 fill-1">favorite</span>
                  {list.likes} likes
                </span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to open · Share & add collaborators inside
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-background-dark px-4 py-2 rounded font-bold text-sm hover:opacity-90 transition-opacity group touch-manipulation"
        >
          <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add</span>
          <span>Create New List</span>
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-background-dark border border-white/10 rounded-2xl p-8 max-w-md w-full space-y-6">
            <h3 className="text-2xl font-bold">Create New List</h3>
            <input
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary"
              placeholder="List title"
              autoFocus
            />
            <textarea
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:ring-2 focus:ring-primary min-h-[80px]"
              placeholder="Description (optional)"
            />
            {error && <p className="text-rose-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={creating || !createTitle.trim()}
                className="flex-1 bg-primary text-background-dark py-3 rounded-xl font-black uppercase tracking-widest disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => { setShowCreate(false); setError(null); setCreateTitle(''); setCreateDesc(''); }}
                disabled={creating}
                className="flex-1 border border-white/20 py-3 rounded-xl font-bold hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lists;
