import React, { useEffect, useState } from 'react';
import { NavigateFn } from '../types';
import { useAuth } from '../context/AuthContext';
import { users } from '../api/client';
import { getAvatarUrl } from '../utils/avatar';
import { getAlbumCoverUrl } from '../utils/albumCover';
import LogEntryDetail from '../components/LogEntryDetail';

interface ProfileProps {
  onNavigate: NavigateFn;
  /** When set, show this user's profile (for shared links). When null, show current user's profile. */
  viewUsername?: string | null;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, viewUsername }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    id: string;
    username: string;
    avatar_url?: string;
    bio?: string;
    albums_count: number;
    reviews_count: number;
    lists_count: number;
  } | null>(null);
  const [favorites, setFavorites] = useState<{ id: string; title: string; artist: string; cover_url?: string }[]>([]);
  const [recentReviews, setRecentReviews] = useState<{ album_title?: string; rating: number; content?: string }[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<{ id: string; album_id: string; album_title?: string; album_artist?: string; album_cover?: string; rating: number; content?: string | null; format?: string | null; tags?: string[]; logged_at: string | null }[]>([]);
  const [selectedLogEntry, setSelectedLogEntry] = useState<typeof diaryEntries[0] | null>(null);
  const [copied, setCopied] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = !viewUsername || (user && viewUsername === user.username);

  useEffect(() => {
    const load = async () => {
      setDiaryEntries([]);
      setSelectedLogEntry(null);
      if (viewUsername) {
        setProfileNotFound(false);
        try {
          const p = await users.getByUsername(viewUsername);
          setProfile(p);
          users.favorites(p.id).then((d) => setFavorites((d || []) as { id: string; title: string; artist: string; cover_url?: string }[]));
          users.reviews(p.id, 3).then((r) => setRecentReviews(r.data || []));
          users.diary(p.id, 10).then((r) => setDiaryEntries(r.data || []));
          if (user) {
            const following = await users.following();
            setIsFollowing(following.some((u) => u.id === p.id));
          }
        } catch {
          setProfile(null);
          setProfileNotFound(true);
          setDiaryEntries([]);
        }
      } else if (user) {
        setProfile(null);
        users.get(user.id).then(setProfile);
        users.favorites(user.id).then((d) => setFavorites((d || []) as { id: string; title: string; artist: string; cover_url?: string }[]));
        users.reviews(user.id, 3).then((r) => setRecentReviews(r.data || []));
        users.diary(user.id, 10).then((r) => setDiaryEntries(r.data || []));
      }
    };
    load();
  }, [user?.id, viewUsername]);

  const handleFollowToggle = async () => {
    if (!profile || isOwnProfile || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await users.unfollow(profile.id);
        setIsFollowing(false);
      } else {
        await users.follow(profile.id);
        setIsFollowing(true);
      }
    } catch {
      // ignore
    } finally {
      setFollowLoading(false);
    }
  };

  const stats = profile || { albums_count: 0, reviews_count: 0, lists_count: 0 };
  const displayName = profile?.username || user?.username || 'Profile';
  const avatarUrl = getAvatarUrl(profile?.avatar_url ?? user?.avatar_url, displayName);

  if (viewUsername && !profile && !profileNotFound) {
    return (
      <div className="max-w-[1000px] mx-auto py-12 px-6 text-center">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (viewUsername && profileNotFound) {
    return (
      <div className="max-w-[1000px] mx-auto py-12 px-6 text-center">
        <p className="text-slate-500">User not found.</p>
        {user && (
          <button onClick={() => onNavigate('profile')} className="mt-4 text-primary hover:underline">
            Back to your profile
          </button>
        )}
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/u/${displayName}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: prompt
      window.prompt('Copy this link:', shareUrl);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
        <div
          className="size-24 md:size-32 bg-center bg-cover rounded-2xl shadow-xl ring-2 ring-primary/10"
          style={{
            backgroundImage: `url(${avatarUrl})`,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        />
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{displayName}</h1>
            {isOwnProfile && (
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/5 transition-all text-xs font-bold"
              >
                <span className="material-symbols-outlined text-base">share</span>
                {copied ? 'Copied!' : 'Share profile'}
              </button>
            )}
            {!isOwnProfile && profile && user && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all disabled:opacity-50 ${
                  isFollowing
                    ? 'bg-white/10 text-slate-400 border border-white/10'
                    : 'bg-primary text-background-dark border border-primary hover:opacity-90'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          <p className="text-slate-400 text-lg font-medium max-w-xl">{profile?.bio || user?.bio || 'No bio yet.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-6 mt-8">
        {[
          { label: 'Albums', value: stats.albums_count.toLocaleString() },
          { label: 'Reviews', value: stats.reviews_count.toLocaleString() },
          { label: 'Lists', value: stats.lists_count.toLocaleString() },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/5 rounded-xl p-4">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl md:text-2xl font-bold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Favorites</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {favorites.map((album) => (
            <div key={album.id} onClick={() => onNavigate('album-detail', album.id)} className="group cursor-pointer space-y-4">
              <div className="aspect-square bg-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all group-hover:-translate-y-2 group-hover:ring-4 ring-primary/50 relative">
                <img src={getAlbumCoverUrl(album.cover_url, album.title, album.artist)} className="w-full h-full object-cover" alt={album.title} />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold truncate">{album.title}</p>
                <p className="text-[9px] text-slate-500 uppercase font-medium">{album.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 border-b border-white/10" />

      <div className="mt-12 space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Album Log</h3>
        {diaryEntries.length === 0 ? (
          <p className="text-slate-500 py-4">No albums logged yet.</p>
        ) : (
          <div className="space-y-4">
            {diaryEntries.map((e) => (
              <div
                key={e.id}
                onClick={() => setSelectedLogEntry(e)}
                className="flex gap-4 items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 cursor-pointer transition-all group"
              >
                <img
                  src={getAlbumCoverUrl(e.album_cover, e.album_title, e.album_artist)}
                  alt={e.album_title || 'Album'}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate group-hover:text-primary transition-colors">{e.album_title || 'Album'}</h4>
                  <p className="text-slate-500 text-sm truncate">{e.album_artist || ''}</p>
                </div>
                <div className="flex items-center gap-1 text-primary shrink-0">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className={`material-symbols-outlined text-lg ${j < Math.floor(e.rating) ? 'fill-1' : ''}`}>star</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {isOwnProfile && diaryEntries.length > 0 && (
          <button
            onClick={() => onNavigate('diary')}
            className="text-primary hover:underline text-sm font-bold"
          >
            View full diary →
          </button>
        )}
      </div>

      <div className="mt-12 space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Recent Reviews</h3>
        {recentReviews.map((r, i) => (
          <div key={i} className="flex gap-6 items-start p-6 rounded-2xl hover:bg-white/5 transition-all">
            <div className="flex-1 space-y-2">
              <h4 className="text-lg font-black">{r.album_title || 'Album'}</h4>
              <div className="flex text-primary">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className={`material-symbols-outlined text-sm ${j < Math.floor(r.rating) ? 'fill-1' : ''}`}>star</span>
                ))}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{r.content || ''}</p>
            </div>
          </div>
        ))}
        {isOwnProfile && recentReviews.length > 0 && (
          <button
            onClick={() => onNavigate('diary')}
            className="text-primary hover:underline text-sm font-bold"
          >
            View full diary →
          </button>
        )}
      </div>

      {selectedLogEntry && (
        <LogEntryDetail
          entry={selectedLogEntry}
          onClose={() => setSelectedLogEntry(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

export default Profile;
