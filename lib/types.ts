export type Movie = {
  id: number
  title: string
  year: number | null
  director: string | null
  genre: string | null
  poster_url: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type MovieWatcher = {
  id: number
  movie_id: number
  user_id: string
  status: 'watched' | 'want_to_watch'
  rating: number | null
  is_favorite: boolean
  is_top_3: boolean
  watched_at: string | null
  created_at: string
  updated_at: string
  movies?: Movie // relation
}

export type Profile = {
  id: string
  email: string
  name: string | null
  created_at: string
  updated_at: string
}

export type MovieComment = {
  id: number
  movie_id: number
  user_id: string
  comment: string
  anonymous_name: string
  created_at: string
  profiles?: Profile // relation
}

export type MovieRecommendation = {
  id: number
  movie_id: number
  recommended_by: string
  recommended_to: string
  watched: boolean
  created_at: string
  updated_at: string
  movies?: Movie // relation
  profiles?: Profile // relation
}
