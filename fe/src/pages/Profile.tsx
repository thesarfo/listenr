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
    following_count?: number;
    followers_count?: number;
  } | null>(null);
  const [favorites, setFavorites] = useState<{ id: string; title: string; artist: string; cover_url?: string }[]>([]);
  const [recentReviews, setRecentReviews] = useState<{ album_title?: string; rating: number; content?: string }[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<{ id: string; album_id: string; album_title?: string; album_artist?: string; album_cover?: string; rating: number; content?: string | null; format?: string | null; tags?: string[]; logged_at: string | null }[]>([]);
  const [selectedLogEntry, setSelectedLogEntry] = useState<typeof diaryEntries[0] | null>(null);
  const [copied, setCopied] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'favorites'>('log');

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
    <div className="max-w-[935px] mx-auto py-4 px-4 md:py-8">
      {/* Header - Instagram style */}
      <header className="flex flex-col sm:flex-row gap-6 sm:gap-12 pb-6 border-b border-white/10">
        <div className="flex justify-center sm:justify-start shrink-0">
          <div
            className="size-20 sm:size-[150px] rounded-full bg-center bg-cover ring-2 ring-white/10"
            style={{
              backgroundImage: `url(${avatarUrl})`,
              backgroundColor: 'rgba(255,255,255,0.05)',
            }}
          />
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
            <h1 className="text-xl font-semibold">{displayName}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {isOwnProfile ? (
                <button
                  onClick={handleShare}
                  className="px-4 py-1.5 rounded text-sm font-semibold bg-white/10 hover:bg-white/15 transition-colors"
                >
                  {copied ? 'Copied!' : 'Share profile'}
                </button>
              ) : profile && user && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors disabled:opacity-50 ${
                    isFollowing ? 'bg-white/10 text-slate-300' : 'bg-primary text-background-dark hover:opacity-90'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => onNavigate('diary')}
                  className="px-4 py-1.5 rounded text-sm font-semibold border border-white/20 hover:bg-white/5 transition-colors"
                >
                  Log album
                </button>
              )}
            </div>
          </div>
          {/* Stats row */}
          <div className="flex justify-center sm:justify-start gap-6 mb-4">
            <span><span className="font-semibold">{stats.albums_count.toLocaleString()}</span> albums</span>
            <span><span className="font-semibold">{(stats.followers_count ?? 0).toLocaleString()}</span> followers</span>
            <span><span className="font-semibold">{(stats.following_count ?? 0).toLocaleString()}</span> following</span>
          </div>
          <p className="text-sm text-slate-300 max-w-md">{profile?.bio || user?.bio || 'No bio yet.'}</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex justify-center border-b border-white/10 mt-6">
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 max-w-[200px] py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'log' ? 'border-white text-white' : 'border-transparent text-slate-500'
          }`}
        >
          Log
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 max-w-[200px] py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'favorites' ? 'border-white text-white' : 'border-transparent text-slate-500'
          }`}
        >
          Favorites
        </button>
      </div>

      {/* Grid - Instagram-style 3 columns */}
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1 mt-1">
        {activeTab === 'log' &&
          (diaryEntries.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-slate-500 text-sm">
              No albums logged yet.{' '}
              {isOwnProfile && (
                <button onClick={() => onNavigate('diary')} className="text-primary hover:underline">
                  Log your first album
                </button>
              )}
            </div>
          ) : (
            diaryEntries.map((e) => (
              <div
                key={e.id}
                onClick={() => setSelectedLogEntry(e)}
                className="aspect-square relative bg-white/5 cursor-pointer group overflow-hidden"
              >
                <img
                  src={getAlbumCoverUrl(e.album_cover, e.album_title, e.album_artist)}
                  alt={e.album_title || 'Album'}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                  <span className="flex items-center gap-0.5 text-primary">
                    <span className="material-symbols-outlined text-lg fill-1">star</span>
                    <span className="font-bold text-sm">{e.rating}</span>
                  </span>
                </div>
              </div>
            ))
          ))}
        {activeTab === 'favorites' &&
          (favorites.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-slate-500 text-sm">No favorites yet.</div>
          ) : (
            favorites.map((album) => (
              <div
                key={album.id}
                onClick={() => onNavigate('album-detail', album.id)}
                className="aspect-square bg-white/5 cursor-pointer overflow-hidden group"
              >
                <img
                  src={getAlbumCoverUrl(album.cover_url, album.title, album.artist)}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
              </div>
            ))
          ))}
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
