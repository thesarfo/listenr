import React, { useState, useEffect } from 'react';
import { albums, reviews } from '../api/client';
import { getAlbumCoverUrl } from '../utils/albumCover';
import LoadingSpinner from '../components/LoadingSpinner';

interface WriteReviewProps {
  albumId: string | null;
  onCancel: () => void;
  onPost: () => void;
}

const WriteReview: React.FC<WriteReviewProps> = ({ albumId, onCancel, onPost }) => {
  const [album, setAlbum] = useState<{ id: string; title: string; artist: string; cover_url?: string } | null>(null);
  const [rating, setRating] = useState(4);
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (!albumId) return;
    albums.get(albumId).then(setAlbum).catch(() => setAlbum(null));
  }, [albumId]);

  const handlePost = async () => {
    if (!albumId || !album) return;
    setIsPosting(true);
    try {
      await reviews.create({
        album_id: albumId,
        rating: rating + (rating < 5 ? 0.5 : 0),
        content: content.trim() || undefined,
        type: 'review',
        share_to_feed: true,
      });
      onPost();
    } catch (e) {
      console.error('Post failed:', e);
      setIsPosting(false);
    }
  };

  if (!albumId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Select an album to log.</p>
        <button onClick={onCancel} className="ml-4 text-primary hover:underline">Cancel</button>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePost();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-background-dark pb-24 md:pb-0">
      <header className="w-full max-w-5xl px-6 py-6 flex items-center justify-between sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md">
        <button onClick={onCancel} className="text-[#92c9a4] hover:text-white transition-colors text-sm font-bold tracking-widest uppercase">
          Cancel
        </button>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
          <h1 className="text-sm font-bold uppercase tracking-[0.3em]">Log Entry</h1>
        </div>
        <button
          onClick={handlePost}
          disabled={isPosting}
          className="hidden md:flex items-center justify-center bg-primary text-background-dark px-6 py-2 rounded font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isPosting ? 'Posting...' : 'Post'}
        </button>
        <div className="w-16 md:hidden" />
      </header>

      <main className="w-full max-w-3xl px-6 py-12 flex flex-col items-center gap-12">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-2xl shadow-2xl overflow-hidden bg-[#193322] border border-white/10">
            <img alt="Album Cover" className="w-full h-full object-cover" src={getAlbumCoverUrl(album.cover_url, album.title, album.artist)} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{album.title}</h2>
            <p className="text-primary text-lg font-bold tracking-widest uppercase">{album.artist}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => setRating(i)} className="transition-transform active:scale-90">
                <span className={`material-symbols-outlined text-5xl md:text-6xl cursor-pointer ${rating >= i ? 'text-primary fill-1' : 'text-white/10'}`}>star</span>
              </button>
            ))}
          </div>
          <p className="text-primary text-xs font-black uppercase tracking-[0.3em]">{rating}.0 Stars</p>
        </div>

        <div className="w-full space-y-3">
          <label htmlFor="review-content" className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg">rate_review</span>
            Add a review
          </label>
          <textarea
            id="review-content"
            className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-lg md:text-xl font-body-serif text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-primary min-h-[140px] leading-relaxed resize-none transition-all"
            placeholder="What did you think? Share your thoughts on this album..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <p className="text-xs text-slate-500">Optional — leave blank for a simple log</p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 p-4 bg-background-dark/95 backdrop-blur-md border-t border-white/10">
        <button
          onClick={handlePost}
          disabled={isPosting}
          className="w-full py-3 bg-primary text-background-dark font-bold rounded disabled:opacity-50 hover:opacity-90 transition-opacity touch-manipulation"
        >
          {isPosting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default WriteReview;
