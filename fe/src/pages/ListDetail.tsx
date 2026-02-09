import React, { useEffect, useState } from 'react';
import { NavigateFn } from '../types';
import { lists } from '../api/client';
import { ApiListDetail, ApiListAlbum, ApiListCollaborator } from '../api/client';
import { getAlbumCoverUrl } from '../utils/albumCover';
import { getAvatarUrl } from '../utils/avatar';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface ListDetailProps {
  listId: string | null;
  onBack: () => void;
  onNavigate: NavigateFn;
}

const ListDetail: React.FC<ListDetailProps> = ({ listId, onBack, onNavigate }) => {
  const { user } = useAuth();
  const [list, setList] = useState<ApiListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [collabUsername, setCollabUsername] = useState('');
  const [collabError, setCollabError] = useState<string | null>(null);
  const [addingCollab, setAddingCollab] = useState(false);

  useEffect(() => {
    if (list?.title) {
      const owner = list.owner_username || 'Someone';
      document.title = `${list.title} by ${owner} on Listenr`;
      return () => { document.title = 'Listenr – Your Personal Music Diary'; };
    }
  }, [list?.title, list?.owner_username]);

  useEffect(() => {
    if (!listId) return;
    let ok = true;
    lists.get(listId).then((d) => {
      if (ok) {
        setList(d);
        setEditTitle(d.title);
        setEditDesc(d.description || '');
      }
    }).catch(() => setList(null)).finally(() => ok && setLoading(false));
    return () => { ok = false; };
  }, [listId]);

  const handleSave = async () => {
    if (!listId || saving) return;
    setSaving(true);
    try {
      const updated = await lists.update(listId, { title: editTitle, description: editDesc || undefined });
      setList((prev) => prev ? { ...prev, ...updated } : null);
      setEditMode(false);
    } catch (e) {
      console.error('Update failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAlbum = async (albumId: string) => {
    if (!listId) return;
    setRemoving(albumId);
    try {
      await lists.removeAlbum(listId, albumId);
      setList((prev) => prev ? { ...prev, albums: prev.albums.filter((a) => a.id !== albumId), albums_count: prev.albums_count - 1 } : null);
    } catch (e) {
      console.error('Remove failed:', e);
    } finally {
      setRemoving(null);
    }
  };

  const canEdit = user && list && (list.user_id === user.id || (list.collaborators || []).some((c: ApiListCollaborator) => c.id === user.id));
  const isOwner = user && list && list.user_id === user.id;

  const handleShare = async () => {
    if (!listId) return;
    const url = `${window.location.origin}/l/${listId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  const handleAddCollaborator = async () => {
    if (!listId || !collabUsername.trim() || addingCollab) return;
    setAddingCollab(true);
    setCollabError(null);
    try {
      const res = await lists.addCollaborator(listId, collabUsername.trim());
      const added = res.user;
      if (added && list) {
        setList((prev) => prev ? {
          ...prev,
          collaborators: [...(prev.collaborators || []), added],
        } : null);
      }
      setShowAddCollaborator(false);
      setCollabUsername('');
    } catch (e) {
      setCollabError((e as Error).message || 'Failed to add collaborator');
    } finally {
      setAddingCollab(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!listId) return;
    try {
      await lists.removeCollaborator(listId, userId);
      setList((prev) => prev ? {
        ...prev,
        collaborators: (prev.collaborators || []).filter((c) => c.id !== userId),
      } : null);
    } catch (e) {
      console.error('Remove collaborator failed:', e);
    }
  };

  const handleDelete = async () => {
    if (!listId || saving) return;
    setSaving(true);
    try {
      await lists.delete(listId);
      onBack();
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const coverUrl = list?.cover_url || (list?.albums?.[0] ? getAlbumCoverUrl(list.albums[0].cover_url, list.albums[0].title, list.albums[0].artist) : undefined);

  if (!listId || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <button onClick={onBack} className="text-primary hover:underline mb-6">← Back</button>
        <p className="text-slate-500">List not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-12">
      <button onClick={onBack} className="text-primary hover:underline flex items-center gap-1 mb-4">
        <span className="material-symbols-outlined text-lg">arrow_back</span> Back
      </button>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-48 h-48 lg:w-64 lg:h-64 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
          <img
            src={coverUrl || getAlbumCoverUrl(undefined, list.title, undefined)}
            className="w-full h-full object-cover"
            alt={list.title}
          />
        </div>
        <div className="flex-1 space-y-4 min-w-0">
          {editMode && canEdit ? (
            <div className="space-y-4">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-white focus:ring-2 focus:ring-primary"
                placeholder="List title"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:ring-2 focus:ring-primary min-h-[80px]"
                placeholder="Description (optional)"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !editTitle.trim()}
                  className="bg-primary text-background-dark px-6 py-2 rounded-xl font-black uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditMode(false); setEditTitle(list.title); setEditDesc(list.description || ''); }}
                  className="border border-white/20 px-6 py-2 rounded-xl font-bold text-sm hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter">{list.title}</h1>
              {list.description && <p className="text-slate-400">{list.description}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 items-center">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">album</span>
                  {list.albums_count} albums
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-rose-500 fill-1">favorite</span>
                  {list.likes} likes
                </span>
                {list.owner_username && (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">person</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('profile', undefined, list.owner_username)}
                      className="hover:text-primary hover:underline"
                    >
                      {list.owner_username}
                    </button>
                    {(list.collaborators?.length ?? 0) > 0 && (
                      <>
                        <span className="text-slate-600">+</span>
                        {(list.collaborators || []).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => onNavigate('profile', undefined, c.username)}
                            className="hover:text-primary hover:underline"
                          >
                            {c.username}
                          </button>
                        ))}
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 pt-1">Share the link to let others view, or add collaborators to edit together.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary/20 border border-primary/40 text-primary hover:bg-primary hover:text-background-dark font-bold text-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">share</span>
                  {copied ? 'Copied!' : 'Share list'}
                </button>
                {canEdit && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/20 hover:bg-white/5 font-bold text-xs"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Edit
                    </button>
                    {isOwner && (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowAddCollaborator(true)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary/20 border border-primary/40 text-primary hover:bg-primary hover:text-background-dark font-bold text-xs transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">group_add</span>
                          Add collaborator
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(true)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                          Delete list
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isOwner && (list.collaborators?.length ?? 0) > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Collaborators</h2>
          <div className="flex flex-wrap gap-4">
            {(list.collaborators || []).map((c) => (
              <div key={c.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                <div className="size-8 rounded-full overflow-hidden bg-white/10 shrink-0">
                  <img src={getAvatarUrl(c.avatar_url, c.username)} alt="" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('profile', undefined, c.username)}
                  className="font-bold text-sm hover:text-primary truncate"
                >
                  {c.username}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveCollaborator(c.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                  title="Remove collaborator"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Albums</h2>
        {(list.albums || []).length === 0 ? (
          <p className="text-slate-500 py-8">No albums in this list yet. Add albums from the album page.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {(list.albums || []).map((a: ApiListAlbum) => (
              <div key={a.id} className="group relative">
                <div
                  onClick={() => onNavigate('album-detail', a.id)}
                  className="cursor-pointer aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-primary/30 transition-all"
                >
                  <img
                    src={getAlbumCoverUrl(a.cover_url, a.title, a.artist)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    alt={a.title}
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <p
                    onClick={() => onNavigate('album-detail', a.id)}
                    className="font-bold truncate cursor-pointer hover:text-primary"
                  >
                    {a.title}
                  </p>
                  <p className="text-slate-500 text-sm truncate">{a.artist}</p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAlbum(a.id)}
                    disabled={removing === a.id}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Remove from list"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {showAddCollaborator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-background-dark border border-white/10 rounded-2xl p-8 max-w-md w-full space-y-6">
            <h3 className="text-xl font-bold">Add collaborator</h3>
            <p className="text-slate-400 text-sm">Enter a username to invite them to edit this list.</p>
            <input
              value={collabUsername}
              onChange={(e) => { setCollabUsername(e.target.value); setCollabError(null); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary"
              placeholder="Username"
              autoFocus
            />
            {collabError && <p className="text-rose-400 text-sm">{collabError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddCollaborator}
                disabled={addingCollab || !collabUsername.trim()}
                className="flex-1 bg-primary text-background-dark py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {addingCollab ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddCollaborator(false); setCollabUsername(''); setCollabError(null); }}
                disabled={addingCollab}
                className="flex-1 border border-white/20 py-3 rounded-xl font-bold hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-background-dark border border-white/10 rounded-2xl p-8 max-w-md w-full space-y-6">
            <h3 className="text-xl font-bold">Delete list?</h3>
            <p className="text-slate-400">This will permanently delete &quot;{list.title}&quot; and remove all albums from it. This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={saving}
                className="flex-1 border border-white/20 py-3 rounded-xl font-bold hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListDetail;
