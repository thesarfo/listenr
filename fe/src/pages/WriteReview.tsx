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

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-background-dark">
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
          className="bg-primary hover:bg-primary/90 text-background-dark px-8 py-2.5 rounded-xl font-black text-sm transition-all transform active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isPosting ? 'Posting...' : 'Post'}
        </button>
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

        <div className="w-full">
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-body-serif italic text-white/90 placeholder:text-white/10 min-h-[300px] leading-relaxed resize-none"
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </main>
    </div>
  );
};

export default WriteReview;
