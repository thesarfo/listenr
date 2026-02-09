import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Review, NavigateFn } from '../types';
import { reviews, albums, users, explore } from '../api/client';
import { getAlbumCoverUrl } from '../utils/albumCover';
import LoadingSpinner from '../components/LoadingSpinner';

interface AlbumBrief {
  id: string;
  title?: string;
  artist?: string;
  cover_url?: string;
  year?: number;
}

interface HomeProps {
  onNavigate: NavigateFn;
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

type FeedFilter = 'all' | 'reviews';

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');
  const [feedReviews, setFeedReviews] = useState<Review[]>([]);
  const [trending, setTrending] = useState<AlbumBrief[]>([]);
  const [popular, setPopular] = useState<AlbumBrief[]>([]);
  const [browse, setBrowse] = useState<AlbumBrief[]>([]);
  const [browseTotal, setBrowseTotal] = useState(0);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [browseLoadingMore, setBrowseLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<{ id: string; username: string; avatar_url?: string }[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const browseResultsRef = useRef<HTMLDivElement>(null);
  const BROWSE_PAGE_SIZE = 24;

  useEffect(() => {
    explore.trending(6).then((d) => setTrending((d as AlbumBrief[]) || []));
    explore.popular(10).then((d) => setPopular((d as AlbumBrief[]) || []));
    explore.genres().then((g) => setGenres((g as string[]) || []));
    users.recommended().then(setRecommended);
  }, []);

  useEffect(() => {
    let ok = true;
    setFeedLoading(true);
    (async () => {
      try {
        const feedRes = await reviews.feed(feedFilter);
        if (!ok) return;
        setFeedReviews(
          (feedRes.data || []).map((r) => ({
            id: r.id,
            userName: r.user_name || 'User',
            userAvatar: r.user_avatar || '',
            albumTitle: r.album_title || '',
            albumCover: r.album_cover || '',
            albumId: r.album_id,
            rating: r.rating,
            content: r.content || '',
            timestamp: formatTimestamp(r.created_at),
            likes: r.likes,
            comments: r.comments,
            type: (r.type as 'review' | 'listen') || 'review',
          }))
        );
      } catch (e) {
        if (ok) setFeedReviews([]);
      } finally {
        if (ok) setFeedLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [feedFilter]);

  const fetchBrowse = useCallback((query: string, genre: string | null, offset = 0, append = false) => {
    if (offset === 0) setBrowseLoading(true);
    else setBrowseLoadingMore(true);
    const limit = BROWSE_PAGE_SIZE;
    const onSuccess = (r: { data: AlbumBrief[]; total: number }) => {
      const data = (r.data || []) as AlbumBrief[];
      setBrowse((prev) => append ? [...prev, ...data] : data);
      setBrowseTotal(r.total ?? 0);
    };
    const onFail = () => {
      if (!append) setBrowse([]);
      setBrowseTotal(0);
    };
    const onFinally = () => {
      setBrowseLoading(false);
      setBrowseLoadingMore(false);
    };
    if (query.trim()) {
      albums.search(query.trim(), limit, offset)
        .then(onSuccess)
        .catch(onFail)
        .finally(onFinally);
    } else if (genre) {
      albums.byGenre(genre, limit, offset)
        .then(onSuccess)
        .catch(onFail)
        .finally(onFinally);
    } else {
      albums.list(limit, offset)
        .then(onSuccess)
        .catch(onFail)
        .finally(onFinally);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBrowse(searchQuery, selectedGenre, 0, false);
    }, searchQuery ? 350 : 0);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenre, fetchBrowse]);

  useEffect(() => {
    if ((searchQuery || selectedGenre) && !browseLoading && browse.length > 0) {
      browseResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchQuery, selectedGenre, browseLoading, browse.length]);

  const loadMoreBrowse = () => {
    fetchBrowse(searchQuery, selectedGenre, browse.length, true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-8 min-w-0">
        {/* Search + Genres */}
        <div className="space-y-4">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none flex items-center justify-center" style={{ fontSize: '1.25rem' }}>search</span>
            <input
              type="text"
              placeholder="Search albums by title or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBrowse(searchQuery, selectedGenre)}
              className={`w-full py-2.5 md:py-2 text-base md:text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary touch-manipulation ${searchQuery ? 'pl-10 pr-10' : 'pl-10 pr-4'}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-500 hover:text-white p-1.5 touch-manipulation"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
          <div className="-mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto overflow-y-hidden pb-2 album-scroll">
            <div className="flex flex-nowrap gap-2 min-w-max">
              <button
                type="button"
                onClick={() => setSelectedGenre(null)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all touch-manipulation ${!selectedGenre ? 'bg-primary text-background-dark' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10'}`}
              >
                All
              </button>
              {genres.map((genre) => (
                <button
                  type="button"
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`shrink-0 px-3 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-colors border touch-manipulation ${selectedGenre === genre ? 'bg-primary text-background-dark border-primary' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10'}`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Browse / Search / Genre results - show prominently when filtering */}
        {(searchQuery || selectedGenre) && (
          <section ref={browseResultsRef} className="space-y-4" id="browse-results">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-l-2 border-primary pl-3">
              {searchQuery ? `Search: "${searchQuery}"` : selectedGenre ? `Genre: ${selectedGenre}` : 'Browse catalog'}
            </h2>
            {browseLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : browse.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {browse.map((a, i) => (
                    <div key={a.id || i} onClick={() => onNavigate('album-detail', a.id)} className="group cursor-pointer space-y-2">
                      <div className="aspect-square rounded-xl bg-white/5 overflow-hidden shadow-xl transition-all group-hover:scale-[1.02] group-hover:ring-1 ring-primary relative">
                        <img src={getAlbumCoverUrl(a.cover_url, a.title, a.artist)} className="w-full h-full object-cover" alt={a.title || 'Album'} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <p className="font-bold text-xs leading-tight text-white">{a.title || 'Album'}</p>
                          <p className="text-primary text-[9px] font-bold uppercase mt-0.5">{a.artist || ''}</p>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold truncate text-white">{a.title || 'Album'}</h3>
                        <p className="text-[9px] text-slate-500 truncate">{a.artist || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {browse.length < browseTotal && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={loadMoreBrowse}
                      disabled={browseLoadingMore}
                      className="px-5 py-2.5 rounded-lg border border-white/20 hover:bg-white/5 font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {browseLoadingMore ? (
                        <>
                          <LoadingSpinner size="sm" className="shrink-0" />
                          Loading...
                        </>
                      ) : (
                        'Load more'
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-500 text-sm py-4">No albums found. Try a different search or genre.</p>
            )}
          </section>
        )}

        {/* Social Activity */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-l-2 border-primary pl-3">From people you follow</h2>
            <div className="flex bg-white/5 p-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              <button
                onClick={() => setFeedFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${feedFilter === 'all' ? 'bg-white/10 text-primary' : 'text-slate-500 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setFeedFilter('reviews')}
                className={`px-3 py-1 rounded-md transition-colors ${feedFilter === 'reviews' ? 'bg-white/10 text-primary' : 'text-slate-500 hover:text-white'}`}
              >
                Reviews
              </button>
            </div>
          </div>
          {feedLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner size="md" />
            </div>
          ) : feedReviews.length > 0 ? (
            <div className="space-y-3">
              {feedReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card-dark rounded-xl border border-white/5 p-4 flex gap-4 hover:border-primary/20 transition-all group cursor-pointer"
                  onClick={() => onNavigate('album-detail', review.albumId)}
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-lg overflow-hidden shadow-xl border border-white/5">
                    <img src={getAlbumCoverUrl(review.albumCover, review.albumTitle, undefined)} className="w-full h-full object-cover" alt={review.albumTitle} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); review.userName && onNavigate('profile', undefined, review.userName); }}
                          className="font-bold text-white hover:text-primary hover:underline focus:outline-none focus:underline"
                        >
                          {review.userName}
                        </button>
                        <span className="text-slate-500 ml-0.5">reviewed</span>
                        <span className="text-white font-bold ml-0.5">{review.albumTitle}</span>
                      </p>
                      <span className="text-[9px] text-slate-500">{review.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`material-symbols-outlined text-primary text-sm ${i < Math.floor(review.rating) ? 'fill-1' : ''}`}>star</span>
                      ))}
                      <span className="ml-1 text-[10px] font-bold text-primary">{review.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{review.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-4">Follow users to see their reviews and listening activity here.</p>
          )}
        </section>

        {/* Trending */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-l-2 border-primary pl-3">Trending</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(trending.length > 0 ? trending : browse).slice(0, 8).map((a, i) => (
              <div key={a.id || i} onClick={() => onNavigate('album-detail', a.id)} className="group cursor-pointer space-y-2">
                <div className="aspect-square rounded-xl bg-white/5 overflow-hidden shadow-xl transition-all group-hover:scale-[1.02] group-hover:ring-1 ring-primary relative">
                  <img src={getAlbumCoverUrl(a.cover_url, a.title, a.artist)} className="w-full h-full object-cover" alt={a.title || 'Album'} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="font-bold text-xs leading-tight text-white">{a.title || 'Album'}</p>
                    <p className="text-primary text-[9px] font-bold uppercase mt-0.5">{a.artist || ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {trending.length === 0 && browse.length === 0 && !browseLoading && (
            <p className="text-slate-500 text-sm py-4">No albums yet. Run the seed script to add albums.</p>
          )}
        </section>

        {/* Popular (most reviewed) */}
        {(popular.length > 0 || browse.length > 0) && (
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-l-2 border-primary pl-3">Popular</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {(popular.length > 0 ? popular : browse).slice(0, 10).map((a, i) => (
                <div key={a.id || i} className="space-y-2 group cursor-pointer" onClick={() => onNavigate('album-detail', a.id)}>
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/5 transition-transform group-hover:scale-[1.02]">
                    <img src={getAlbumCoverUrl(a.cover_url, a.title, a.artist)} className="w-full h-full object-cover" alt={a.title || 'Album'} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold truncate text-white">{a.title || 'Album'}</h3>
                    <p className="text-[9px] text-slate-500 truncate">{a.artist || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Browse Catalog */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-l-2 border-primary pl-3">Browse catalog</h2>
            {!browseLoading && browseTotal > 0 && (
              <span className="text-[10px] text-slate-500 font-bold">{browse.length} of {browseTotal}</span>
            )}
          </div>
          {browseLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {browse.map((a, i) => (
                  <div key={a.id || i} onClick={() => onNavigate('album-detail', a.id)} className="group cursor-pointer space-y-2">
                    <div className="aspect-square rounded-xl bg-white/5 overflow-hidden shadow-xl transition-all group-hover:scale-[1.02] group-hover:ring-1 ring-primary relative">
                      <img src={getAlbumCoverUrl(a.cover_url, a.title, a.artist)} className="w-full h-full object-cover" alt={a.title || 'Album'} />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="font-bold text-xs leading-tight text-white">{a.title || 'Album'}</p>
                        <p className="text-primary text-[9px] font-bold uppercase mt-0.5">{a.artist || ''}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {browse.length < browseTotal && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={loadMoreBrowse}
                    disabled={browseLoadingMore}
                    className="px-5 py-2.5 rounded-lg border border-white/20 hover:bg-white/5 font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {browseLoadingMore ? (
                      <>
                        <LoadingSpinner size="sm" className="shrink-0" />
                        Loading...
                      </>
                    ) : (
                      'Load more'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <aside className="w-full lg:w-56 shrink-0 space-y-4">
        <div className="bg-card-dark rounded-xl border border-white/5 p-4 sticky top-20">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-4">Trending albums</h3>
          <div className="grid grid-cols-3 gap-2">
            {trending.slice(0, 6).map((a, i) => (
              <div
                key={a.id || i}
                onClick={() => onNavigate('album-detail', a.id)}
                className="aspect-square rounded-lg bg-white/5 overflow-hidden cursor-pointer hover:ring-1 hover:ring-primary transition-all"
              >
                <img src={getAlbumCoverUrl(a.cover_url, a.title, a.artist)} className="w-full h-full object-cover" alt={a.title || 'Album'} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card-dark rounded-xl border border-white/5 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-4">Recommended</h3>
          <div className="space-y-3">
            {recommended.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('profile', undefined, u.username)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left group/usr"
                >
                  <div className="size-8 rounded-full bg-white/5 overflow-hidden border border-white/10 shrink-0 ring-0 group-hover/usr:ring-1 group-hover/usr:ring-primary transition-all">
                    {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : null}
                  </div>
                  <p className="text-xs font-bold truncate text-white group-hover/usr:text-primary transition-colors">{u.username}</p>
                </button>
                <button type="button" className="text-[9px] font-bold uppercase bg-primary/10 text-primary px-2.5 py-1 rounded hover:bg-primary hover:text-background-dark transition-colors shrink-0">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Home;
