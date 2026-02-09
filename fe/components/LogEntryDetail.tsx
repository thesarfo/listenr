import React from 'react';
import { NavigateFn } from '../types';
import { getAlbumCoverUrl } from '../utils/albumCover';

interface LogEntry {
  id: string;
  album_id: string;
  album_title?: string;
  album_artist?: string;
  album_cover?: string;
  rating: number;
  content?: string | null;
  format?: string | null;
  tags?: string[];
  logged_at: string | null;
}

interface LogEntryDetailProps {
  entry: LogEntry;
  onClose: () => void;
  onNavigate: NavigateFn;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const LogEntryDetail: React.FC<LogEntryDetailProps> = ({ entry, onClose, onNavigate }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="bg-background-dark border border-white/10 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-bold">Album Log</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div
            onClick={() => { onClose(); onNavigate('album-detail', entry.album_id); }}
            className="flex gap-3 cursor-pointer group"
          >
            <img
              src={getAlbumCoverUrl(entry.album_cover, entry.album_title, entry.album_artist)}
              alt={entry.album_title || 'Album'}
              className="w-16 h-16 rounded-lg bg-slate-800 shrink-0 object-cover shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                {entry.album_title || 'Album'}
              </h4>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-0.5">
                {entry.album_artist || ''}
              </p>
              <p className="text-slate-400 text-xs mt-2">{formatDate(entry.logged_at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 text-primary">
            {[...Array(5)].map((_, j) => (
              <span
                key={j}
                className={`material-symbols-outlined text-lg ${j < Math.floor(entry.rating) ? 'fill-1' : ''}`}
              >
                star
              </span>
            ))}
            <span className="ml-2 text-slate-400 font-bold">{entry.rating}/5</span>
          </div>

          {entry.format && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Format</p>
              <p className="text-sm font-bold capitalize">{entry.format}</p>
            </div>
          )}

          {entry.content && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Notes</p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
            </div>
          )}

          {entry.tags && entry.tags.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => { onClose(); onNavigate('album-detail', entry.album_id); }}
              className="flex-1 bg-primary text-background-dark py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform"
            >
              View Album
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-white/20 font-bold text-sm hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogEntryDetail;
