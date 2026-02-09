import React, { useEffect, useState } from 'react';
import { admin, albums } from '../api/client';
import type { AdminAnalytics } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAlbumCoverUrl } from '../utils/albumCover';
import type { NavigateFn } from '../types';

interface AdminProps {
  onNavigate: NavigateFn;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const Admin: React.FC<AdminProps> = ({ onNavigate }) => {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dedupLoading, setDedupLoading] = useState(false);
  const [dedupResult, setDedupResult] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'albums' | null>(null);
  const [albumsList, setAlbumsList] = useState<{ id: string; title?: string; artist?: string; cover_url?: string; year?: number }[]>([]);
  const [albumsTotal, setAlbumsTotal] = useState(0);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [albumsOffset, setAlbumsOffset] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const loadAnalytics = () => admin.analytics().then(setData);

  useEffect(() => {
    loadAnalytics()
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const loadAlbums = (offset = 0, append = false) => {
    setAlbumsLoading(true);
    albums.list(50, offset)
      .then((r) => {
        const items = (r.data || []) as { id: string; title?: string; artist?: string; cover_url?: string; year?: number }[];
        setAlbumsList((prev) => append ? [...prev, ...items] : items);
        setAlbumsTotal(r.total ?? 0);
        setAlbumsOffset(offset + items.length);
      })
      .catch(() => setAlbumsList([]))
      .finally(() => setAlbumsLoading(false));
  };

  useEffect(() => {
    if (activeSection === 'albums') loadAlbums(0, false);
  }, [activeSection]);

  const handleDeleteAlbum = async (albumId: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleteLoading(albumId);
    try {
      await admin.deleteAlbum(albumId);
      setAlbumsList((prev) => prev.filter((a) => a.id !== albumId));
      setAlbumsTotal((prev) => Math.max(0, prev - 1));
      if (data) setData({ ...data, counts: { ...data.counts, albums: data.counts.albums - 1 } });
    } catch {
      // ignore
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeduplicate = async () => {
    setDedupLoading(true);
    setDedupResult(null);
    try {
      const res = await admin.deduplicateAlbums();
      setDedupResult(res.removed);
      await loadAnalytics();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Deduplication failed');
    } finally {
      setDedupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1000px] mx-auto py-12 px-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => onNavigate('home')} className="text-primary hover:underline">
          Back to Home
        </button>
      </div>
    );
  }

  if (!data) return null;

  const maxActivity = Math.max(1, ...data.activity_by_day.map((d) => d.total));

  if (activeSection === 'albums') {
    return (
      <div className="max-w-[1200px] mx-auto py-6 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveSection(null)}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </button>
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight mb-6">Albums ({albumsTotal})</h2>
        {albumsLoading && albumsList.length === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : albumsList.length === 0 ? (
          <p className="text-slate-500 py-8">No albums found.</p>
        ) : (
          <div className="space-y-2">
            {albumsList.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card-dark border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div
                  className="size-12 rounded-lg overflow-hidden bg-white/5 shrink-0 cursor-pointer"
                  onClick={() => onNavigate('album-detail', a.id)}
                >
                  <img
                    src={getAlbumCoverUrl(a.cover_url, a.title, a.artist)}
                    alt=""
                    className="w-full h-full object-cover group-hover:opacity-90"
                  />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onNavigate('album-detail', a.id)}>
                  <p className="font-bold truncate text-white">{a.title || 'Untitled'}</p>
                  <p className="text-xs text-slate-500 truncate">{a.artist || ''} {a.year ? `(${a.year})` : ''}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('album-detail', a.id)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold transition-colors"
                  >
                    View / Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(a.id, a.title || 'Untitled'); }}
                    disabled={!!deleteLoading}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {deleteLoading === a.id ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-sm">delete</span>}
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {albumsList.length < albumsTotal && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => loadAlbums(albumsOffset, true)}
                  disabled={albumsLoading}
                  className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 text-sm font-bold disabled:opacity-50"
                >
                  {albumsLoading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const cardSections: { label: string; value: number; icon: string; onClick?: () => void }[] = [
    { label: 'Users', value: data.counts.users, icon: 'person' },
    { label: 'Albums', value: data.counts.albums, icon: 'album', onClick: () => setActiveSection('albums') },
    { label: 'Tracks', value: data.counts.tracks, icon: 'music_note' },
    { label: 'Reviews', value: data.counts.reviews, icon: 'rate_review' },
    { label: 'Log Entries', value: data.counts.log_entries, icon: 'menu_book' },
    { label: 'Lists', value: data.counts.lists, icon: 'list' },
    { label: 'Follows', value: data.counts.follows, icon: 'people' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-6 px-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black tracking-tight uppercase">Admin Dashboard</h1>
          <button
            onClick={() => onNavigate('home')}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeduplicate}
            disabled={dedupLoading}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {dedupLoading ? 'Running...' : 'Remove duplicate albums'}
          </button>
          {dedupResult !== null && (
            <span className="text-sm text-primary">
              Removed {dedupResult} duplicate(s)
            </span>
          )}
        </div>
      </div>

      {/* Counts grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {cardSections.map(({ label, value, icon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick ?? undefined}
            className={`bg-card-dark rounded-xl border border-white/5 p-4 text-left w-full transition-all ${onClick ? 'cursor-pointer hover:border-primary/50 hover:bg-white/5' : 'cursor-default'}`}
          >
            <span className="material-symbols-outlined text-primary text-xl mb-2">{icon}</span>
            <p className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
          </button>
        ))}
      </section>

      {/* Last 7 days */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Last 7 days</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card-dark rounded-xl border border-white/5 p-4">
            <p className="text-xl font-bold text-primary tabular-nums">+{data.last_7_days.new_users}</p>
            <p className="text-xs text-slate-500">New users</p>
          </div>
          <div className="bg-card-dark rounded-xl border border-white/5 p-4">
            <p className="text-xl font-bold text-primary tabular-nums">+{data.last_7_days.reviews}</p>
            <p className="text-xs text-slate-500">Reviews</p>
          </div>
          <div className="bg-card-dark rounded-xl border border-white/5 p-4">
            <p className="text-xl font-bold text-primary tabular-nums">+{data.last_7_days.log_entries}</p>
            <p className="text-xs text-slate-500">Log entries</p>
          </div>
        </div>
      </section>

      {/* Activity chart */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Activity (last 14 days)</h2>
        <div className="bg-card-dark rounded-xl border border-white/5 p-4 flex items-end gap-1 h-32">
          {data.activity_by_day.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.date}: ${d.total} activities`}>
              <div
                className="w-full bg-primary/80 rounded-t min-h-[4px] transition-all group-hover:bg-primary"
                style={{ height: `${Math.max(4, (d.total / maxActivity) * 100)}%` }}
              />
              <span className="text-[8px] text-slate-500 rotate-0 hidden md:inline">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top reviewers */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Top reviewers</h2>
          <div className="bg-card-dark rounded-xl border border-white/5 overflow-hidden">
            {data.top_reviewers.length === 0 ? (
              <p className="p-4 text-slate-500 text-sm">No reviews yet</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {data.top_reviewers.map((r, i) => (
                  <li key={r.user_id} className="flex items-center justify-between px-4 py-3 hover:bg-white/5">
                    <span className="text-slate-400 text-sm w-6">#{i + 1}</span>
                    <span className="font-bold truncate flex-1 mx-2">{r.username}</span>
                    <span className="text-primary font-bold tabular-nums">{r.reviews_count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Top genres */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Top genres</h2>
          <div className="bg-card-dark rounded-xl border border-white/5 overflow-hidden">
            {data.top_genres.length === 0 ? (
              <p className="p-4 text-slate-500 text-sm">No genres yet</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {data.top_genres.map((g, i) => (
                  <li key={g.genre} className="flex items-center justify-between px-4 py-3 hover:bg-white/5">
                    <span className="text-slate-400 text-sm w-6">#{i + 1}</span>
                    <span className="font-medium truncate flex-1 mx-2 capitalize">{g.genre}</span>
                    <span className="text-primary font-bold tabular-nums">{g.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Recent activity */}
      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Recent activity</h2>
        <div className="bg-card-dark rounded-xl border border-white/5 overflow-hidden">
          {data.recent_activity.length === 0 ? (
            <p className="p-4 text-slate-500 text-sm">No recent activity</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {data.recent_activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">
                      <span className="text-slate-400">{a.username}</span>
                      <span className="mx-1">·</span>
                      <span>{a.album_title}</span>
                    </p>
                    <p className="text-xs text-slate-500 truncate">{a.album_artist}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-primary font-bold">{a.rating}</span>
                    <span className="material-symbols-outlined text-primary text-sm fill-1">star</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{formatDate(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default Admin;
