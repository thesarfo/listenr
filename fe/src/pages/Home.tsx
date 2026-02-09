import React, { useEffect, useState } from 'react';
import { View, Review, NavigateFn } from '../types';
import { reviews, users, explore } from '../api/client';
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
  const [recommended, setRecommended] = useState<{ id: string; username: string; avatar_url?: string }[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    explore.trending(6).then((d) => setTrending((d as AlbumBrief[]) || []));
    explore.popular(10).then((d) => setPopular((d as AlbumBrief[]) || []));
    users.recommended().then(setRecommended);
    users.following().then((list) => setFollowingIds(new Set(list.map((u) => u.id))));
  }, []);

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    if (followLoading) return;
    setFollowLoading(userId);
    try {
      if (isFollowing) {
        await users.unfollow(userId);
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await users.follow(userId);
        setFollowingIds((prev) => new Set(prev).add(userId));
      }
    } catch {
      // ignore
    } finally {
      setFollowLoading(null);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-8 min-w-0">
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
            {trending.slice(0, 8).map((a, i) => (
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
          {trending.length === 0 && (
            <p className="text-slate-500 text-sm py-4">No albums yet. Run the seed script to add albums.</p>
          )}
        </section>

        {/* Popular (most reviewed) */}
        {popular.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-l-2 border-primary pl-3">Popular</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {popular.slice(0, 10).map((a, i) => (
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
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleFollow(u.id, followingIds.has(u.id)); }}
                  disabled={!!followLoading}
                  className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded transition-colors shrink-0 disabled:opacity-50 ${
                    followingIds.has(u.id)
                      ? 'bg-white/10 text-slate-400'
                      : 'bg-primary/10 text-primary hover:bg-primary hover:text-background-dark'
                  }`}
                >
                  {followingIds.has(u.id) ? 'Following' : 'Follow'}
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
