
export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl: string;
  rating?: number;
  genre?: string[];
  tracklist?: string[];
  description?: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  albumTitle: string;
  albumCover: string;
  rating: number;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  type: 'review' | 'listen';
}

export type View = 'onboarding' | 'home' | 'explore' | 'album-detail' | 'diary' | 'profile' | 'lists' | 'write-review';
