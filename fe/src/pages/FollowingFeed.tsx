import React, { useEffect, useState } from 'react';
import { View, Review, NavigateFn } from '../types';
import { reviews } from '../api/client';
import { getAlbumCoverUrl } from '../utils/albumCover';
import LoadingSpinner from '../components/LoadingSpinner';

interface FollowingFeedProps {
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

const PAGE_SIZE = 20;

const FollowingFeed: React.FC<FollowingFeedProps> = ({ onNavigate }) => {
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');
  const [feedReviews, setFeedReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFeed = async (offset: number, append: boolean) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);
    try {
      const feedRes = await reviews.feed(feedFilter, PAGE_SIZE, offset);
      const mapped = (feedRes.data || []).map((r) => ({
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
      }));
      setTotal(feedRes.total ?? 0);
      setFeedReviews((prev) => (append ? [...prev, ...mapped] : mapped));
    } catch {
      if (!append) setFeedReviews([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadFeed(0, false);
  }, [feedFilter]);

  const hasMore = feedReviews.length < total;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <button
        onClick={() => onNavigate('home')}
        className="text-primary hover:underline flex items-center gap-1 mb-6"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back
      </button>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Activity from people you follow</h1>
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

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : feedReviews.length === 0 ? (
          <p className="text-slate-500 py-12 text-center">Follow users to see their reviews and listening activity here.</p>
        ) : (
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
            {hasMore && (
              <button
                onClick={() => loadFeed(feedReviews.length, true)}
                disabled={loadingMore}
                className="w-full py-3 text-sm font-bold text-primary hover:bg-white/5 rounded-xl border border-white/10 transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowingFeed;
