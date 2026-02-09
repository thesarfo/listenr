import React, { useEffect, useState } from 'react';
import { NavigateFn } from '../types';
import { albums, users, lists } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getAlbumCoverUrl } from '../utils/albumCover';
import LoadingSpinner from '../components/LoadingSpinner';

interface AlbumDetailProps {
  albumId: string | null;
  onBack: () => void;
  onReview: () => void;
  onNavigate?: NavigateFn;
}

const AlbumDetail: React.FC<AlbumDetailProps> = ({ albumId, onBack, onReview, onNavigate }) => {
  const { user } = useAuth();
  const [album, setAlbum] = useState<{
    id: string;
    title: string;
    artist: string;
    year?: number;
    cover_url?: string;
    description?: string;
    wikipedia_url?: string;
    genres: string[];
    label?: string;
    avg_rating?: number;
    total_logs?: number;
    tracks?: { number: number; title: string; duration?: string }[];
  } | null>(null);
  const [reviews, setReviews] = useState<{ user_name?: string; rating: number; content?: string }[]>([]);
  const [ratings, setRatings] = useState<{ five: number; four: number; three: number; two: number; one: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);
  const [userLists, setUserLists] = useState<{ id: string; title: string }[]>([]);
  const [addingToListId, setAddingToListId] = useState<string | null>(null);

  useEffect(() => {
    if (!albumId) return;
    let ok = true;
    (async () => {
      try {
        const [a, revRes, distRes] = await Promise.all([
          albums.get(albumId),
          albums.reviews(albumId, 5),
          albums.ratingsDistribution(albumId),
        ]);
        if (!ok) return;
        setAlbum(a);
        setReviews(revRes.data || []);
        setRatings(distRes);
      } catch (e) {
        console.error('Album fetch error:', e);
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [albumId]);

  useEffect(() => {
    if (user && albumId) {
      users.favorites(user.id).then((favs) => {
        const ids = ((favs || []) as { id: string }[]).map((f) => f.id);
        setFavoriteIds(ids);
        setIsFavorited(ids.includes(albumId));
      }).catch(() => {});
    } else {
      setFavoriteIds([]);
      setIsFavorited(false);
    }
  }, [user?.id, albumId]);

  useEffect(() => {
    if (showAddToList && user) {
      lists.list().then((d) => {
        setUserLists((d || []).map((l) => ({ id: l.id, title: l.title })));
      }).catch(() => setUserLists([]));
    }
  }, [showAddToList, user]);

  const handleAddToList = async (listId: string) => {
    if (!albumId) return;
    setAddingToListId(listId);
    try {
      await lists.addAlbum(listId, albumId);
      setShowAddToList(false);
    } catch (e) {
      console.error('Add to list failed:', e);
    } finally {
      setAddingToListId(null);
    }
  };

  if (!albumId || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={onBack} className="text-primary hover:underline text-sm mb-4">← Back</button>
        <p className="text-slate-500">Album not found.</p>
      </div>
    );
  }

  const genres = album.genres || [];
  const pcts = ratings ? [ratings.five, ratings.four, ratings.three, ratings.two, ratings.one] : [0, 0, 0, 0, 0];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
      <button onClick={onBack} className="text-primary hover:underline flex items-center gap-1 text-sm mb-2">
        <span className="material-symbols-outlined text-base">arrow_back</span> Back
      </button>
      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-end">
        <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 rounded-xl shadow-xl overflow-hidden border border-white/10">
          <img src={getAlbumCoverUrl(album.cover_url, album.title, album.artist)} className="w-full h-full object-cover" alt={album.title} />
        </div>
        <div className="flex-1 text-center lg:text-left space-y-3">
          <div className="space-y-0.5">
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Album</span>
            <p className="text-slate-500 text-xs font-medium mt-1">{album.year ? `Released ${album.year}` : ''}</p>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">{album.title}</h1>
            <p className="text-lg md:text-xl text-primary font-semibold italic">{album.artist}</p>
          </div>
          <div className="flex justify-center lg:justify-start gap-8 pt-2">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Avg Rating</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold">{album.avg_rating?.toFixed(1) ?? '—'}</span>
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-sm ${(album.avg_rating ?? 0) >= i + 0.5 ? 'fill-1' : ''}`}>star</span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Total Logs</p>
              <p className="text-xl font-bold">{album.total_logs ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-xl border border-white/5 max-w-fit mx-auto lg:mx-0">
        <button
          onClick={onReview}
          className="bg-primary text-background-dark px-5 py-2 rounded-lg font-bold uppercase tracking-wider text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Log Album
        </button>
        {user && (
          <>
            <button
              onClick={async () => {
                if (!albumId || favoriteLoading) return;
                setFavoriteLoading(true);
                try {
                  const newIds = isFavorited
                    ? favoriteIds.filter((id) => id !== albumId)
                    : [...favoriteIds, albumId];
                  await users.updateFavorites(newIds);
                  setFavoriteIds(newIds);
                  setIsFavorited(!isFavorited);
                } catch (e) {
                  console.error('Favorite update failed:', e);
                } finally {
                  setFavoriteLoading(false);
                }
              }}
              disabled={favoriteLoading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-white/20 hover:bg-white/5 font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined ${isFavorited ? 'fill-1 text-primary' : ''}`}>
                favorite
              </span>
              {isFavorited ? 'Favorited' : 'Add to Favorites'}
            </button>
            <button
              onClick={() => setShowAddToList(true)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-white/20 hover:bg-white/5 font-bold uppercase tracking-wider text-xs transition-all"
            >
              <span className="material-symbols-outlined text-base">playlist_add</span>
              Add to List
            </button>
          </>
        )}
      </div>

      {showAddToList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-background-dark border border-white/10 rounded-xl p-5 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-base font-bold mb-3">Add to List</h3>
            <div className="overflow-y-auto flex-1 min-h-0 space-y-2">
              {userLists.length === 0 ? (
                <p className="text-slate-500 py-4">No lists yet. Create one from the Lists page.</p>
              ) : (
                userLists.map((list) => (
                  <div
                    key={list.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5"
                  >
                    <span className="font-bold">{list.title}</span>
                    <button
                      onClick={() => handleAddToList(list.id)}
                      disabled={addingToListId === list.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background-dark font-bold text-sm disabled:opacity-50"
                    >
                      {addingToListId === list.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <span className="material-symbols-outlined text-lg">add</span>
                      )}
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex gap-3">
              {onNavigate && (
                <button
                  onClick={() => { setShowAddToList(false); onNavigate('lists'); }}
                  className="flex-1 border border-primary text-primary py-3 rounded-xl font-bold hover:bg-primary/10"
                >
                  Create new list
                </button>
              )}
              <button
                onClick={() => setShowAddToList(false)}
                className="flex-1 border border-white/20 py-3 rounded-xl font-bold hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        <div className="lg:col-span-2 space-y-8">
          {album.description && (
            <section className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">About</h2>
              <p className="text-slate-300 leading-relaxed">{album.description}</p>
              {album.wikipedia_url && album.description.length >= 550 && (
                <a
                  href={album.wikipedia_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-bold"
                >
                  Read more on Wikipedia
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                </a>
              )}
            </section>
          )}

          {album.tracks && album.tracks.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Tracklist</h2>
              <div className="divide-y divide-white/5 border-y border-white/5">
                {album.tracks.map((t) => (
                  <div key={t.number} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-white/5 px-2 transition-colors rounded-lg">
                    <div className="flex items-center gap-6">
                      <span className="text-slate-600 font-mono text-xs">{String(t.number).padStart(2, '0')}</span>
                      <p className="font-bold group-hover:text-primary transition-colors">{t.title}</p>
                    </div>
                    <span className="text-slate-600 font-mono text-xs">{t.duration || ''}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Popular Reviews</h2>
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {r.user_name && onNavigate ? (
                        <button
                          type="button"
                          onClick={() => onNavigate('profile', undefined, r.user_name)}
                          className="text-sm font-bold hover:text-primary hover:underline focus:outline-none focus:underline text-left"
                        >
                          {r.user_name}
                        </button>
                      ) : (
                        <p className="text-sm font-bold">{r.user_name || 'User'}</p>
                      )}
                      <div className="flex text-primary text-xs">
                        {[...Array(5)].map((_, j) => (
                          <span key={j} className={`material-symbols-outlined text-[14px] ${j < Math.floor(r.rating) ? 'fill-1' : ''}`}>star</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{r.content || ''}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <div className="bg-card-dark p-5 rounded-xl border border-white/5 space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Ratings</h3>
            <div className="space-y-3">
              {pcts.map((pct, i) => (
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
                  {genres.map((g) => (
                    <span key={g} className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-slate-300 border border-white/10">{g}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;
