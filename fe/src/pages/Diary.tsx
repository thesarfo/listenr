import React, { useEffect, useState } from 'react';
import { NavigateFn } from '../types';
import { diary } from '../api/client';
import { getAlbumCoverUrl } from '../utils/albumCover';
import LogEntryDetail from '../components/LogEntryDetail';
import LoadingSpinner from '../components/LoadingSpinner';

interface DiaryProps {
  onNavigate: NavigateFn;
}

interface LogEntry {
  id: string;
  album_id: string;
  album_title?: string;
  album_artist?: string;
  album_cover?: string;
  rating: number;
  content?: string | null;
  format?: string | null;
  logged_at: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupByMonth(entries: LogEntry[]): Record<string, LogEntry[]> {
  const groups: Record<string, LogEntry[]> = {};
  for (const e of entries) {
    const d = new Date(e.logged_at || '');
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return groups;
}

const Diary: React.FC<DiaryProps> = ({ onNavigate }) => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);

  const load = () => {
    diary.list({ limit: 100 }).then((r) => {
      setEntries(r.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleExport = async () => {
    try {
      const res = await diary.export('json');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `listenr-diary-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  const grouped = groupByMonth(entries);
  const months = Object.keys(grouped).sort().reverse();

  return (
    <div className="max-w-[960px] mx-auto py-6 px-4">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Listening Diary</h1>
          <p className="text-primary/70 text-sm font-medium">{entries.length} albums logged</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg h-9 px-5 bg-primary text-background-dark text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <span className="material-symbols-outlined text-base">file_download</span>
          Export
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-slate-500 py-8 text-sm">No diary entries yet. Log an album to get started.</p>
      ) : (
        <div className="relative space-y-0">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-white/10" />
          {months.map((monthKey) => {
            const [y, m] = monthKey.split('-');
            const monthLabel = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const monthEntries = grouped[monthKey];
            return (
              <div key={monthKey} className="pb-10">
                <div className="relative pl-12 py-6 mb-8 flex items-center">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-primary/30" />
                  <span className="text-primary/50 text-[10px] font-black uppercase tracking-[0.3em]">{monthLabel}</span>
                </div>
                {monthEntries.map((e) => (
                  <div key={e.id} className="relative pl-10 pb-8 group last:pb-0">
                    <div className="absolute left-[9px] top-3 size-2 rounded-full bg-primary ring-2 ring-background-dark z-10" />
                    <div
                      onClick={() => setSelectedEntry(e)}
                      className="flex flex-col md:flex-row md:items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-primary/40 transition-all cursor-pointer"
                    >
                      <div className="w-12 md:w-16 text-slate-500 font-bold text-[9px] uppercase tracking-wider shrink-0">
                        {formatDate(e.logged_at)}
                      </div>
                      <div className="flex flex-1 items-center gap-4 min-w-0">
                        <div
                          className="size-12 md:size-14 rounded-lg bg-slate-800 shrink-0 shadow-xl bg-cover"
                          style={{ backgroundImage: `url(${getAlbumCoverUrl(e.album_cover, e.album_title, e.album_artist)})` }}
                        />
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm md:text-base truncate group-hover:text-primary transition-colors">
                            {e.album_title || 'Album'}
                          </h3>
                          <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider mt-0.5">
                            {e.album_artist || ''} • <span className="text-primary/70">{e.format || 'digital'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-primary pt-2 md:pt-0">
                        {[...Array(5)].map((_, j) => (
                          <span key={j} className={`material-symbols-outlined text-sm ${j < Math.floor(e.rating) ? 'fill-1' : ''}`}>
                            {j < Math.floor(e.rating) ? 'star' : 'star_outline'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {selectedEntry && (
        <LogEntryDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

export default Diary;
