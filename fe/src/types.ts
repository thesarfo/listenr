export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl: string;
  rating?: number;
  genre?: string[];
  genres?: string[];
  tracklist?: string[];
  description?: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  albumTitle: string;
  albumCover: string;
  albumId?: string;
  rating: number;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  type: 'review' | 'listen';
}

export type View = 'landing' | 'onboarding' | 'home' | 'album-detail' | 'diary' | 'profile' | 'lists' | 'list-detail' | 'log-album' | 'write-review' | 'login' | 'admin' | 'following-feed' | 'not-found';

export type NavigateFn = (view: View, albumId?: string, username?: string, listId?: string) => void;
