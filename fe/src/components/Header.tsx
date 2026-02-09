import React, { useEffect, useState } from 'react';
import { View } from '../types';
import type { NavigateFn } from '../types';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';
import { notifications, users } from '../api/client';
import type { ApiNotification } from '../api/client';

interface HeaderProps {
  onNavigate: (view: View) => void;
  navigate?: NavigateFn;
  onLogout: () => void;
  onMenuClick?: () => void;
}

function formatNotifTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

const Header: React.FC<HeaderProps> = ({ onNavigate, navigate, onLogout, onMenuClick }) => {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifData, setNotifData] = useState<{ data: ApiNotification[]; unread_count: number } | null>(null);

  const loadNotifs = () => {
    notifications.list(15).then((r) => setNotifData({ data: r.data || [], unread_count: r.unread_count || 0 }));
  };

  useEffect(() => {
    if (user) {
      loadNotifs();
      const interval = setInterval(loadNotifs, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const handleNotifClick = (n: ApiNotification) => {
    notifications.markRead(n.id).then(() => loadNotifs());
    setNotifOpen(false);
    if (navigate && n.ref_id) {
      if (n.type === 'follow') {
        users.get(n.ref_id).then((u) => navigate('profile', undefined, u.username, undefined)).catch(() => {});
      } else if (n.type === 'list_like' || n.type === 'collaborator_added') {
        navigate('list-detail', undefined, undefined, n.ref_id);
      }
    }
  };

  return (
    <header className="h-14 md:h-14 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-background-dark/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2.5 -ml-1 rounded-lg hover:bg-white/5 shrink-0 touch-manipulation"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-2xl md:text-lg">menu</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) loadNotifs(); }}
            className="size-11 md:size-8 rounded-full hover:bg-white/10 flex items-center justify-center relative transition-colors text-slate-400 hover:text-white touch-manipulation"
          >
            <span className="material-symbols-outlined text-xl md:text-lg">notifications</span>
            {notifData && notifData.unread_count > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary text-background-dark text-[10px] font-bold rounded-full">
                {notifData.unread_count > 99 ? '99+' : notifData.unread_count}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] overflow-y-auto bg-card-dark rounded-xl border border-white/10 shadow-xl z-50">
                <div className="p-3 border-b border-white/10 flex justify-between items-center">
                  <span className="text-sm font-bold">Notifications</span>
                  {notifData && notifData.unread_count > 0 && (
                    <button
                      onClick={() => notifications.markAllRead().then(() => loadNotifs())}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {!notifData ? (
                    <p className="p-4 text-slate-500 text-sm">Loading...</p>
                  ) : notifData.data.length === 0 ? (
                    <p className="p-4 text-slate-500 text-sm">No notifications yet</p>
                  ) : (
                    notifData.data.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
                      >
                        <p className="text-sm text-white font-medium">{n.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{formatNotifTime(n.created_at)}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="relative group">
          <button 
            onClick={() => onNavigate('profile')}
            className="size-11 md:size-8 rounded-full bg-white/10 bg-cover bg-center border border-transparent hover:border-primary transition-all overflow-hidden touch-manipulation"
            style={{ backgroundImage: `url(${getAvatarUrl(user?.avatar_url, user?.username || '')})` }}
          />
          <div className="absolute right-0 top-full mt-1 py-1 bg-card-dark rounded-lg border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[100px]">
            <button onClick={onLogout} className="w-full px-4 py-3 md:py-1.5 text-left text-sm md:text-xs hover:bg-white/5 rounded touch-manipulation">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
