/**
 * API client for Listenr backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';
const API_PREFIX = '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('musicboxd_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${API_PREFIX}${path}`;
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.detail || res.statusText);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

// Auth
export const auth = {
  register: (data: { username: string; email: string; password: string }) =>
    request<{ access_token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request<{ id: string; username: string; email: string; avatar_url?: string; bio?: string }>('/auth/me'),
};

// Albums
export const albums = {
  list: (limit = 50, offset = 0) =>
    request<{ data: unknown[]; total: number }>(`/albums?limit=${limit}&offset=${offset}`),
  search: (q: string, limit = 20, offset = 0) =>
    request<{ data: unknown[]; total: number }>(`/albums/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`),
  byGenre: (genre: string, limit = 50, offset = 0) =>
    request<{ data: unknown[]; total: number }>(`/albums/by-genre/${encodeURIComponent(genre)}?limit=${limit}&offset=${offset}`),
  get: (id: string) => request<AlbumDetail>(`/albums/${id}`),
  update: (id: string, data: { description?: string }) =>
    request<AlbumDetail>(`/albums/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  refreshCover: (id: string) => request<AlbumDetail>(`/albums/${id}/cover`, { method: 'PATCH' }),
  trending: (limit = 10) =>
    request<unknown[]>(`/albums/trending?limit=${limit}`),
  ratingsDistribution: (id: string) =>
    request<{ five: number; four: number; three: number; two: number; one: number }>(`/albums/${id}/ratings-distribution`),
  reviews: (id: string, limit = 20, offset = 0) =>
    request<{ data: ApiReview[]; total: number }>(`/albums/${id}/reviews?limit=${limit}&offset=${offset}`),
};

// Notifications
export interface ApiNotification {
  id: string;
  type: string;
  title: string | null;
  body: string | null;
  ref_id: string | null;
  read: boolean;
  created_at: string | null;
}

export const notifications = {
  list: (limit = 20, offset = 0) =>
    request<{ data: ApiNotification[]; total: number; unread_count: number }>(
      `/notifications?limit=${limit}&offset=${offset}`
    ),
  markRead: (id: string) =>
    request<{ message: string }>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () =>
    request<{ message: string }>('/notifications/read-all', { method: 'PATCH' }),
};

// Reviews
export const reviews = {
  feed: (filter = 'all', limit = 20, offset = 0) =>
    request<{ data: ApiReview[]; total: number }>(`/reviews?filter=${filter}&limit=${limit}&offset=${offset}`),
  create: (data: { album_id: string; rating: number; content?: string; type?: string; tags?: string[]; share_to_feed?: boolean }) =>
    request<unknown>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
};

// Diary
export const diary = {
  list: (params?: { month?: string; rating_min?: number; format?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.month) q.set('month', params.month);
    if (params?.rating_min != null) q.set('rating_min', String(params.rating_min));
    if (params?.format) q.set('format', params.format);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.offset) q.set('offset', String(params.offset));
    return request<{ data: ApiLogEntry[]; total: number }>(`/diary?${q}`);
  },
  create: (data: { album_id: string; rating: number; content?: string; format?: string; tags?: string[] }) =>
    request<unknown>('/diary', { method: 'POST', body: JSON.stringify(data) }),
  export: (format: 'json' | 'csv' = 'json') =>
    fetch(`${API_BASE}${API_PREFIX}/diary/export?format=${format}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
};

// Lists
export const lists = {
  list: () => request<ApiList[]>('/lists'),
  liked: () => request<ApiList[]>('/lists/liked'),
  get: (id: string) => request<ApiListDetail>(`/lists/${id}`),
  create: (data: { title: string; description?: string }) =>
    request<ApiList>('/lists', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { title?: string; description?: string }) =>
    request<ApiList>(`/lists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ message: string }>(`/lists/${id}`, { method: 'DELETE' }),
  addAlbum: (listId: string, albumId: string) =>
    request<{ message: string }>(`/lists/${listId}/albums`, {
      method: 'POST',
      body: JSON.stringify({ album_id: albumId }),
    }),
  removeAlbum: (listId: string, albumId: string) =>
    request<{ message: string }>(`/lists/${listId}/albums/${albumId}`, { method: 'DELETE' }),
  like: (listId: string) => request<{ message: string }>(`/lists/${listId}/like`, { method: 'POST' }),
  unlike: (listId: string) => request<{ message: string }>(`/lists/${listId}/like`, { method: 'DELETE' }),
  addCollaborator: (listId: string, username: string) =>
    request<{ message: string; user?: { id: string; username: string; avatar_url?: string } }>(
      `/lists/${listId}/collaborators`,
      { method: 'POST', body: JSON.stringify({ username }) }
    ),
  removeCollaborator: (listId: string, userId: string) =>
    request<{ message: string }>(`/lists/${listId}/collaborators/${userId}`, { method: 'DELETE' }),
};

// Explore
export const explore = {
  trending: (limit = 10) => request<unknown[]>(`/explore/trending?limit=${limit}`),
  popular: (limit = 10) => request<unknown[]>(`/explore/popular?limit=${limit}`),
  popularWithFriends: (limit = 10) => request<unknown[]>(`/explore/popular-with-friends?limit=${limit}`),
  genres: () => request<string[]>('/explore/genres'),
};

// Admin
export const admin = {
  analytics: () => request<AdminAnalytics>('/admin/analytics'),
  deduplicateAlbums: () =>
    request<{ message: string; removed: number }>('/admin/deduplicate-albums', { method: 'POST' }),
  deleteAlbum: (albumId: string) =>
    request<{ message: string }>(`/admin/albums/${albumId}`, { method: 'DELETE' }),
};

// AI
export const ai = {
  albumInsight: (albumId: string) =>
    request<{ result: string }>('/ai/album-insight', {
      method: 'POST',
      body: JSON.stringify({ album_id: albumId }),
    }),
};

// Users
export const users = {
  get: (id: string) => request<ApiUserProfile>(`/users/${id}`),
  getByUsername: (username: string) => request<ApiUserProfile>(`/users/by-username/${encodeURIComponent(username)}`),
  favorites: (id: string) => request<unknown[]>(`/users/${id}/favorites`),
  diary: (userId: string, limit = 20, offset = 0) =>
    request<{ data: ApiLogEntry[]; total: number }>(`/users/${userId}/diary?limit=${limit}&offset=${offset}`),
  reviews: (id: string, limit = 5, offset = 0) =>
    request<{ data: ApiReview[]; total: number }>(`/users/${id}/reviews?limit=${limit}&offset=${offset}`),
  updateFavorites: (albumIds: string[]) =>
    request<{ message: string }>('/users/me/favorites', {
      method: 'PUT',
      body: JSON.stringify({ album_ids: albumIds }),
    }),
  recommended: () => request<{ id: string; username: string; avatar_url?: string }[]>('/users/recommended'),
  follow: (userId: string) => request<{ message: string }>(`/users/${userId}/follow`, { method: 'POST' }),
  unfollow: (userId: string) => request<{ message: string }>(`/users/${userId}/follow`, { method: 'DELETE' }),
  following: () => request<{ id: string; username: string; avatar_url?: string }[]>('/users/me/following'),
  followers: (userId: string) => request<{ id: string; username: string; avatar_url?: string }[]>(`/users/${userId}/followers`),
  followingList: (userId: string) => request<{ id: string; username: string; avatar_url?: string }[]>(`/users/${userId}/following`),
};

// Types matching backend responses
export interface ApiUserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  albums_count: number;
  reviews_count: number;
  lists_count: number;
  following_count?: number;
  followers_count?: number;
}

export interface ApiReview {
  id: string;
  user_id: string;
  album_id: string;
  rating: number;
  content: string | null;
  type: string;
  tags: string[];
  share_to_feed: boolean;
  created_at: string | null;
  likes: number;
  comments: number;
  user_name?: string;
  user_avatar?: string;
  album_title?: string;
  album_cover?: string;
}

export interface ApiLogEntry {
  id: string;
  user_id: string;
  album_id: string;
  rating: number;
  content: string | null;
  format: string | null;
  tags: string[];
  logged_at: string | null;
  album_title?: string;
  album_artist?: string;
  album_cover?: string;
}

export interface ApiListPreviewAlbum {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
}

export interface ApiList {
  id: string;
  user_id: string;
  owner_username?: string;
  title: string;
  description?: string;
  cover_url?: string;
  preview_albums?: ApiListPreviewAlbum[];
  albums_count: number;
  likes: number;
  user_liked?: boolean;
  created_at?: string;
}

export interface ApiListCollaborator {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface ApiListAlbum {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
}

export interface ApiListDetail extends ApiList {
  albums: ApiListAlbum[];
  collaborators?: ApiListCollaborator[];
}

export interface AdminAnalytics {
  counts: {
    users: number;
    albums: number;
    tracks: number;
    reviews: number;
    log_entries: number;
    lists: number;
    follows: number;
  };
  last_7_days: {
    new_users: number;
    reviews: number;
    log_entries: number;
  };
  activity_by_day: { date: string; reviews: number; log_entries: number; total: number }[];
  top_reviewers: { user_id: string; username: string; reviews_count: number }[];
  top_genres: { genre: string; count: number }[];
  recent_activity: {
    id: string;
    username: string;
    album_title: string;
    album_artist: string;
    rating: number;
    created_at: string | null;
  }[];
}

export interface AlbumDetail {
  id: string;
  title: string;
  artist: string;
  year?: number;
  cover_url?: string;
  genres: string[];
  label?: string;
  length_seconds?: number;
  description?: string;
  wikipedia_url?: string;
  avg_rating?: number;
  total_logs?: number;
  tracks?: { id: string; number: number; title: string; duration?: string }[];
  created_at?: string;
}
