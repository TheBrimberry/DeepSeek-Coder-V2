export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin' | 'moderator';
  is_age_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  source_url: string;
  embed_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  view_count: number;
  like_count: number;
  dislike_count: number;
  source_id: string;
  is_active: boolean;
  is_featured: boolean;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  thumbnail_url: string | null;
  video_count: number;
  is_active: boolean;
  created_at: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  video_count: number;
  created_at: Date;
}

export interface Source {
  id: string;
  name: string;
  slug: string;
  base_url: string;
  logo_url: string | null;
  is_active: boolean;
  last_scraped_at: Date | null;
  scrape_config: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export interface VideoCategory {
  video_id: string;
  category_id: string;
}

export interface VideoTag {
  video_id: string;
  tag_id: string;
}

export interface UserFavorite {
  user_id: string;
  video_id: string;
  created_at: Date;
}

export interface UserHistory {
  id: string;
  user_id: string;
  video_id: string;
  watched_at: Date;
  watch_duration: number | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchParams extends PaginationParams {
  query?: string;
  categoryId?: string;
  tagId?: string;
  sourceId?: string;
  minDuration?: number;
  maxDuration?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}
