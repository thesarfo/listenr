import React, { useEffect, useState } from 'react';
import { admin } from '../api/client';
import type { AdminAnalytics } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
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

  useEffect(() => {
    admin.analytics()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="max-w-[1200px] mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black tracking-tight uppercase">Admin Dashboard</h1>
        <button
          onClick={() => onNavigate('home')}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Counts grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {[
          { label: 'Users', value: data.counts.users, icon: 'person' },
          { label: 'Albums', value: data.counts.albums, icon: 'album' },
          { label: 'Tracks', value: data.counts.tracks, icon: 'music_note' },
          { label: 'Reviews', value: data.counts.reviews, icon: 'rate_review' },
          { label: 'Log Entries', value: data.counts.log_entries, icon: 'menu_book' },
          { label: 'Lists', value: data.counts.lists, icon: 'list' },
          { label: 'Follows', value: data.counts.follows, icon: 'people' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-card-dark rounded-xl border border-white/5 p-4">
            <span className="material-symbols-outlined text-primary text-xl mb-2">{icon}</span>
            <p className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
          </div>
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
