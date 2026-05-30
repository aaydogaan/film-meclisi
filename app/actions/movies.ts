'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type MovieInput = {
  title: string
  year?: number | null
  director?: string | null
  genre?: string | null
  posterUrl?: string | null
}

async function getUserId() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return user.id
}

export async function getMovies() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('movies')
    .select('*, movie_comments(user_id), movie_watchers(user_id, rating, status)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function addMovie(input: MovieInput, addToWatchlist: boolean = false): Promise<number> {
  const userId = await getUserId()
  const title = input.title?.trim()
  if (!title) throw new Error('Film adı gerekli')

  console.log('addMovie called with addToWatchlist:', addToWatchlist)

  const supabase = await createClient()
  const { data, error } = await supabase.from('movies').insert({
    title,
    year: input.year ?? null,
    director: input.director?.trim() || null,
    genre: input.genre?.trim() || null,
    poster_url: input.posterUrl?.trim() || null,
    created_by: userId,
  }).select('id')
  .single()

  if (error) throw new Error(error.message)
  
  const movieId = data.id
  console.log('Movie created with ID:', movieId)
  revalidatePath('/')
  
  // Add to watchlist if requested
  if (addToWatchlist) {
    try {
      console.log('Attempting to add to watchlist...')
      const watchlist = await getOrCreateWatchlist(userId)
      console.log('Watchlist found/created:', watchlist.id)
      await addMovieToList(watchlist.id, movieId)
      console.log('Successfully added to watchlist')
    } catch (err) {
      console.error('Watchlist addition failed:', err)
      // Don't throw - movie was added successfully
    }
  }
  
  return movieId
}

export async function updateMovie(id: number, input: MovieInput) {
  const userId = await getUserId()
  const title = input.title?.trim()
  if (!title) throw new Error('Film adı gerekli')

  const supabase = await createClient()
  const { error } = await supabase
    .from('movies')
    .update({
      title,
      year: input.year ?? null,
      director: input.director?.trim() || null,
      genre: input.genre?.trim() || null,
      poster_url: input.posterUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('created_by', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function deleteMovie(id: number) {
  const userId = await getUserId()
  const supabase = await createClient()
  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', id)
    .eq('created_by', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

// İzleme durumu işlemleri
export async function addMovieWatcher(movieId: number, status: 'watched' | 'want_to_watch', rating?: number) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  const { error } = await supabase.from('movie_watchers').upsert({
    movie_id: movieId,
    user_id: userId,
    status,
    rating: status === 'watched' ? rating : null,
    watched_at: status === 'watched' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'movie_id,user_id'
  })

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function getMovieWatchers(movieId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movie_watchers')
    .select('*')
    .eq('movie_id', movieId)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function toggleFavorite(movieId: number, isFavorite: boolean) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('movie_watchers')
    .update({ 
      is_favorite: isFavorite,
      updated_at: new Date().toISOString()
    })
    .eq('movie_id', movieId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath(`/movies/${movieId}`)
}

export async function toggleTop3(movieId: number, isTop3: boolean) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  if (isTop3) {
    // Check if already 3
    const { count } = await supabase
      .from('movie_watchers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_top_3', true)
      
    if (count && count >= 3) {
      throw new Error('En fazla 3 filmi ilk 3 listesine ekleyebilirsiniz.')
    }
  }

  const { error } = await supabase
    .from('movie_watchers')
    .update({ 
      is_top_3: isTop3,
      updated_at: new Date().toISOString()
    })
    .eq('movie_id', movieId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath(`/movies/${movieId}`)
}

export async function getMovieById(movieId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', movieId)
    .single()
    
  if (error) throw new Error(error.message)
  return data
}

// Yorum işlemleri
export async function addMovieComment(movieId: number, comment: string, anonymousName: string) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  const { error } = await supabase.from('movie_comments').insert({
    movie_id: movieId,
    user_id: userId,
    comment: comment.trim(),
    anonymous_name: anonymousName.trim(),
  })

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function getMovieComments(movieId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movie_comments')
    .select('*')
    .eq('movie_id', movieId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function deleteMovieComment(commentId: number) {
  const userId = await getUserId()
  const supabase = await createClient()
  const { error } = await supabase
    .from('movie_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

// Film önerileri
export async function addRecommendation(movieId: number, recommendedTo: string) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  const { error } = await supabase.from('movie_recommendations').insert({
    movie_id: movieId,
    recommended_by: userId,
    recommended_to: recommendedTo,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function getRecommendations(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movie_recommendations')
    .select(`
      *,
      movies (*)
    `)
    .eq('recommended_to', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  
  // Manually get recommender profiles
  const recommendations = data ?? []
  const recommenderIds = [...new Set(recommendations.map((r: any) => r.recommended_by))]
  
  if (recommenderIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', recommenderIds)
    
    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]))
    
    return recommendations.map((r: any) => ({
      ...r,
      profiles: profileMap.get(r.recommended_by)
    }))
  }
  
  return recommendations
}

export async function markRecommendationAsWatched(recommendationId: number) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('movie_recommendations')
    .update({ 
      watched: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', recommendationId)
    .eq('recommended_to', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function deleteRecommendation(recommendationId: number) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('movie_recommendations')
    .delete()
    .eq('id', recommendationId)
    .eq('recommended_by', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

// Kullanıcı istatistikleri
export async function getUserStats(userId: string) {
  const supabase = await createClient()
  
  const [{ data: watchedMovies }, { data: userComments }] = await Promise.all([
    supabase
      .from('movie_watchers')
      .select('movie_id')
      .eq('user_id', userId)
      .eq('status', 'watched'),
    supabase
      .from('movie_comments')
      .select('id')
      .eq('user_id', userId)
  ])

  return {
    watchedCount: watchedMovies?.length ?? 0,
    commentCount: userComments?.length ?? 0,
  }
}

export async function getAllUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
  
  if (error) throw new Error(error.message)
  return (data ?? []).map((user: any) => ({
    ...user,
    avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user.name || user.email)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
  }))
}

export async function getUserById(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw new Error(error.message)
  return {
    ...data,
    avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(data.name || data.email)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
  }
}

export async function getUserFavorites(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movie_watchers')
    .select(`
      *,
      movies (*)
    `)
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('updated_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getUserTop3(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movie_watchers')
    .select(`
      *,
      movies (*)
    `)
    .eq('user_id', userId)
    .eq('is_top_3', true)
    .order('updated_at', { ascending: false })
    .limit(3)
  
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getUserWatchedMovies(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movie_watchers')
    .select(`
      *,
      movies (*)
    `)
    .eq('user_id', userId)
    .eq('status', 'watched')
    .order('watched_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getUserWantToWatchMovies(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movie_watchers')
    .select(`
      *,
      movies (*)
    `)
    .eq('user_id', userId)
    .eq('status', 'want_to_watch')
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getRecentActivities(limit: number = 10) {
  const supabase = await createClient()
  
  // Get recent comments
  const { data: comments } = await supabase
    .from('movie_comments')
    .select(`
      created_at,
      comment,
      anonymous_name,
      user_id,
      movie_id,
      movies (title, poster_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  // Get recent recommendations
  const { data: recommendations } = await supabase
    .from('movie_recommendations')
    .select(`
      created_at,
      recommended_by,
      recommended_to,
      movie_id,
      movies (title, poster_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  // Get recent watches
  const { data: watches } = await supabase
    .from('movie_watchers')
    .select(`
      created_at,
      status,
      rating,
      user_id,
      movie_id,
      movies (title, poster_url)
    `)
    .eq('status', 'watched')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  // Get all user IDs from recommendations and watches
  const userIds = new Set<string>()
  recommendations?.forEach((r: any) => {
    userIds.add(r.recommended_by)
    userIds.add(r.recommended_to)
  })
  watches?.forEach((w: any) => userIds.add(w.user_id))
  
  // Fetch user names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', Array.from(userIds))
  
  const profileMap = new Map(profiles?.map((p: any) => [p.id, p]))
  
  // Combine and format activities
  const activities: any[] = []
  
  comments?.forEach((c: any) => {
    activities.push({
      id: `comment-${c.created_at}`,
      type: 'comment',
      user: c.anonymous_name,
      user_id: c.user_id,
      user_name: c.anonymous_name,
      action: 'yorum yaptı',
      target: c.comment,
      movie_id: c.movie_id,
      movie_title: c.movies?.title,
      movie_poster: c.movies?.poster_url,
      created_at: c.created_at,
    })
  })
  
  recommendations?.forEach((r: any) => {
    const fromProfile = profileMap.get(r.recommended_by)
    const toProfile = profileMap.get(r.recommended_to)
    activities.push({
      id: `rec-${r.created_at}`,
      type: 'recommendation',
      user: fromProfile?.name || fromProfile?.email || 'Bir kullanıcı',
      user_id: r.recommended_by,
      user_name: fromProfile?.name || fromProfile?.email || 'Bir kullanıcı',
      action: 'şu filmi önerdi',
      movie_id: r.movie_id,
      movie_title: r.movies?.title,
      movie_poster: r.movies?.poster_url,
      to: toProfile?.name || toProfile?.email || 'bir kullanıcıya',
      created_at: r.created_at,
    })
  })

  watches?.forEach((w: any) => {
    const profile = profileMap.get(w.user_id)
    activities.push({
      id: `watch-${w.created_at}`,
      type: 'watch',
      user: profile?.name || profile?.email || 'Bir kullanıcı',
      user_id: w.user_id,
      user_name: profile?.name || profile?.email || 'Bir kullanıcı',
      action: 'şu filmi izledi',
      rating: w.rating,
      movie_id: w.movie_id,
      movie_title: w.movies?.title,
      movie_poster: w.movies?.poster_url,
      created_at: w.created_at,
    })
  })
  
  // Sort by date and limit
  return activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
}

// Film Listeleri
export async function createMovieList(formData: FormData) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const isPublic = formData.get('isPublic') === 'true'
  
  if (!name?.trim()) throw new Error('Liste adı gerekli')
  
  const { error } = await supabase.from('movie_lists').insert({
    user_id: userId,
    name: name.trim(),
    description: description?.trim() || null,
    is_public: isPublic,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function getMovieLists(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movie_lists')
    .select(`
      *,
      movie_list_items (
        movie_id,
        movies (title, poster_url)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function addMovieToList(listId: number, movieId: number) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  const { error } = await supabase.from('movie_list_items').insert({
    list_id: listId,
    movie_id: movieId,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function removeMovieFromList(listId: number, movieId: number) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('movie_list_items')
    .delete()
    .eq('list_id', listId)
    .eq('movie_id', movieId)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function deleteMovieList(listId: number) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('movie_lists')
    .delete()
    .eq('id', listId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function getMovieListById(listId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movie_lists')
    .select(`
      *,
      movie_list_items (
        *,
        movies (*)
      )
    `)
    .eq('id', listId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getOrCreateWatchlist(userId: string) {
  const supabase = await createClient()
  
  // Try to find existing watchlist
  const { data: existing } = await supabase
    .from('movie_lists')
    .select('*')
    .eq('user_id', userId)
    .eq('is_watchlist', true)
    .single()
  
  if (existing) return existing
  
  // Create new watchlist
  const { data, error } = await supabase
    .from('movie_lists')
    .insert({
      user_id: userId,
      name: 'İlk İzlenecekler',
      description: 'İzlemek istediğim filmler',
      is_public: false,
      is_watchlist: true,
    })
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

// İstatistikler
export async function getUserStatistics(userId: string) {
  const supabase = await createClient()
  
  // İzlenen filmler
  const { data: watchedMovies } = await supabase
    .from('movie_watchers')
    .select(`
      rating,
      watched_at,
      movies (genre, year)
    `)
    .eq('user_id', userId)
    .eq('status', 'watched')
  
  // Yorumlar
  const { count: commentCount } = await supabase
    .from('movie_comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  // Tür bazlı istatistikler
  const genreStats: Record<string, number> = {}
  watchedMovies?.forEach((w: any) => {
    const genre = w.movies?.genre || 'Diğer'
    genreStats[genre] = (genreStats[genre] || 0) + 1
  })
  
  // Yıllık istatistikler
  const yearStats: Record<string, number> = {}
  watchedMovies?.forEach((w: any) => {
    const year = w.movies?.year?.toString() || 'Bilinmiyor'
    yearStats[year] = (yearStats[year] || 0) + 1
  })
  
  // Aylık istatistikler
  const monthlyStats: Record<string, number> = {}
  watchedMovies?.forEach((w: any) => {
    if (w.watched_at) {
      const month = new Date(w.watched_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
      monthlyStats[month] = (monthlyStats[month] || 0) + 1
    }
  })
  
  // Ortalama puan
  const ratings = watchedMovies?.map((w: any) => w.rating).filter((r: any) => r) || []
  const avgRating = ratings.length > 0 
    ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length 
    : 0
  
  return {
    totalWatched: watchedMovies?.length || 0,
    totalComments: commentCount || 0,
    genreStats,
    yearStats,
    monthlyStats,
    avgRating: Math.round(avgRating * 10) / 10,
  }
}

// Liderlik Tablosu
export async function getLeaderboard() {
  const supabase = await createClient()
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email')
  
  if (!profiles) return []
  
  const leaderboard = await Promise.all(
    profiles.map(async (profile: any) => {
      const [{ count: watchedCount }, { count: commentCount }] = await Promise.all([
        supabase
          .from('movie_watchers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('status', 'watched'),
        supabase
          .from('movie_comments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id),
      ])
      
      return {
        ...profile,
        watchedCount: watchedCount ?? 0,
        commentCount: commentCount ?? 0,
        totalScore: (watchedCount ?? 0) * 2 + (commentCount ?? 0),
      }
    })
  )
  
  return leaderboard.sort((a, b) => b.totalScore - a.totalScore)
}

// Film Sıralaması (Ortalama Puan)
export async function getMovieRankings() {
  const supabase = await createClient()
  
  const { data: movies } = await supabase
    .from('movies')
    .select('*')
  
  if (!movies) return []
  
  const rankings = await Promise.all(
    movies.map(async (movie: any) => {
      const { data: watchers } = await supabase
        .from('movie_watchers')
        .select('rating')
        .eq('movie_id', movie.id)
        .eq('status', 'watched')
        .not('rating', 'is', null)
      
      const ratings = watchers?.map((w: any) => w.rating).filter(Boolean) || []
      const avgRating = ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : 0
      
      return {
        ...movie,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingCount: ratings.length,
      }
    })
  )
  
  return rankings.filter(r => r.ratingCount > 0).sort((a, b) => b.avgRating - a.avgRating)
}

export async function checkIfUserHasMovie(title: string, year?: number | null): Promise<boolean> {
  const userId = await getUserId()
  const supabase = await createClient()

  // First check if movie exists
  const { data: movie } = await supabase
    .from('movies')
    .select('id')
    .ilike('title', title)
    .eq('year', year ?? null)
    .limit(1)
    .maybeSingle()

  if (!movie) return false

  // Check if user has it
  const { data: watcher } = await supabase
    .from('movie_watchers')
    .select('id')
    .eq('movie_id', movie.id)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  return !!watcher
}

// Film Ekleme (Durum, Puan ve Yorum ile Birlikte)
export async function addMovieWithStatus(
  input: MovieInput,
  status: 'watched' | 'want_to_watch',
  rating?: number,
  comment?: string
) {
  const userId = await getUserId()
  const title = input.title?.trim()
  if (!title) throw new Error('Film adı gerekli')

  const supabase = await createClient()

  // Film var mı kontrol et (Aynı isim ve yıla sahip)
  let movieId: number

  const { data: existingMovie } = await supabase
    .from('movies')
    .select('id')
    .ilike('title', title)
    .eq('year', input.year ?? null)
    .limit(1)
    .maybeSingle()

  if (existingMovie) {
    movieId = existingMovie.id
  } else {
    // Film ekle
    const { data: movieData, error: movieError } = await supabase
      .from('movies')
      .insert({
        title,
        year: input.year ?? null,
        director: input.director?.trim() || null,
        genre: input.genre?.trim() || null,
        poster_url: input.posterUrl?.trim() || null,
        created_by: userId,
      })
      .select('id')
      .single()

    if (movieError) throw new Error(movieError.message)
    movieId = movieData.id
  }

  // İzleme durumunu ekle
  const { error: watcherError } = await supabase.from('movie_watchers').upsert({
    movie_id: movieId,
    user_id: userId,
    status,
    rating: status === 'watched' ? (rating ?? null) : null,
    watched_at: status === 'watched' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'movie_id,user_id'
  })

  if (watcherError) throw new Error(watcherError.message)

  // İzlediyse ve yorum yazdıysa yorumu ekle
  if (status === 'watched' && comment?.trim()) {
    // Get user's profile to get their name
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .single()
      
    const userName = profile?.name || profile?.email || 'İsimsiz Kullanıcı'

    const { error: commentError } = await supabase.from('movie_comments').insert({
      movie_id: movieId,
      user_id: userId,
      comment: comment.trim(),
      anonymous_name: userName,
    })
    if (commentError) {
      console.error('Yorum kaydedilemedi:', commentError.message)
    }
  }

  revalidatePath('/')
  return movieId
}

// İzleme Durumunu Kaldır
export async function removeMovieWatcher(movieId: number) {
  const userId = await getUserId()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('movie_watchers')
    .delete()
    .eq('movie_id', movieId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/watchlist')
  revalidatePath(`/movies/${movieId}`)
}
