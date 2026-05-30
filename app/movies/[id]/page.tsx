import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { 
  getMovieById, 
  getMovieComments, 
  addMovieComment, 
  getMovieWatchers,
  toggleFavorite,
  toggleTop3,
  getAllUsers
} from '@/app/actions/movies'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Clapperboard, Heart, Trophy, MessageSquare, Calendar, User } from 'lucide-react'
import { RecommendDialog } from '@/components/recommend-dialog'
import { MovieActions } from '@/components/movie-actions'
import { MovieCommentForm } from '@/components/movie-comment-form'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const movieId = parseInt(id, 10)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const movie = await getMovieById(movieId)
  if (!movie) {
    return (
      <div className="min-h-svh bg-background">
        <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
        <main className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Film bulunamadı.</p>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </main>
      </div>
    )
  }

  const comments = await getMovieComments(movieId)
  const watchers = await getMovieWatchers(movieId)
  const users = await getAllUsers()
  
  // Exclude current user from recommendation list
  const usersToRecommend = users.filter((u: any) => u.id !== user.id)

  const currentUserWatcher = watchers.find((w: any) => w.user_id === user.id)
  const isFavorite = currentUserWatcher?.is_favorite ?? false
  const isTop3 = currentUserWatcher?.is_top_3 ?? false
  const hasWatched = currentUserWatcher?.status === 'watched'
  
  const defaultName = user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Anonim'

  // Calculate Community Rating
  const validRatings = watchers.filter((w: any) => typeof w.rating === 'number' && w.rating > 0)
  const averageRating = validRatings.length > 0 
    ? (validRatings.reduce((sum: number, w: any) => sum + w.rating, 0) / validRatings.length).toFixed(1)
    : null

  // Fetch TMDB/IMDb Rating
  let imdbRating = null
  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(movie.title)}&language=tr-TR&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
    if (res.ok) {
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        let bestMatch = data.results[0]
        if (movie.year) {
          const yearMatch = data.results.find((r: any) => (r.release_date || r.first_air_date || '').startsWith(movie.year.toString()))
          if (yearMatch) bestMatch = yearMatch
        }
        if (bestMatch.vote_average && bestMatch.vote_average > 0) {
          imdbRating = bestMatch.vote_average.toFixed(1)
        }
      }
    }
  } catch(e) {}

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20 pb-12">
      <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
      
      {/* Hero Section */}
      <div className="relative w-full min-h-[60vh] sm:min-h-[70vh] bg-background flex flex-col justify-end">
        {movie.poster_url ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-top sm:bg-center sm:opacity-40 sm:blur-xl sm:scale-110"
              style={{ backgroundImage: `url(${movie.poster_url})` }}
            />
            {/* Gradients to blend with background */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 sm:via-background/80 to-transparent" />
            <div className="absolute inset-0 sm:bg-gradient-to-r from-background via-background/40 to-transparent hidden sm:block" />
          </>
        ) : (
          <div className="absolute inset-0 bg-secondary/10" />
        )}
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12 flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-end mt-40 sm:mt-0">
          {/* Poster - Only visible on desktop */}
          <div className="hidden sm:block w-64 shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-card">
            {movie.poster_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={movie.poster_url} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
            ) : (
              <div className="w-full aspect-[2/3] flex items-center justify-center bg-secondary/50">
                <Clapperboard className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Title & Info */}
          <div className="flex-1 w-full pb-4 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-4 drop-shadow-xl leading-tight">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm sm:text-base text-white/90 font-medium mb-8">
              {movie.year && (
                <span className="text-white font-bold">{movie.year}</span>
              )}
              {movie.year && movie.genre && <span className="w-1.5 h-1.5 rounded-full bg-white/50" />}
              {movie.genre && (
                <span className="text-white/80">{movie.genre}</span>
              )}
              {movie.genre && movie.director && <span className="w-1.5 h-1.5 rounded-full bg-white/50" />}
              {movie.director && (
                <span className="text-white/80"><span className="opacity-70">Yönetmen:</span> {movie.director}</span>
              )}
            </div>
            
            <div className="flex items-center justify-center sm:justify-start gap-4 mb-8 text-white">
              <div className="flex flex-col items-center p-3 bg-white/10 rounded-xl backdrop-blur-md min-w-[100px]">
                <span className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">IMDB Puanı</span>
                <span className="text-2xl font-bold text-yellow-400">{imdbRating || '?'}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white/10 rounded-xl backdrop-blur-md min-w-[100px]">
                <span className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">Meclis Puanı</span>
                <span className="text-2xl font-bold text-emerald-400">{averageRating || '?'}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-4 items-center">
              <MovieActions 
                movieId={movieId} 
                initialFavorite={isFavorite} 
                initialTop3={isTop3}
                movieTitle={movie.title}
                users={usersToRecommend}
                hasWatched={hasWatched}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl w-full px-4 pt-8 sm:px-6 pb-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
          
          {/* Left Column: Comments */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                İzleyici Yorumları ({comments.length})
              </h2>
              
              {/* Comment Form */}
              {hasWatched ? (
                <MovieCommentForm 
                  movieId={movieId} 
                  movieTitle={movie.title} 
                  defaultName={defaultName} 
                />
              ) : (
                <div className="mb-8 p-6 bg-secondary/30 border border-border border-dashed rounded-xl text-center">
                  <p className="text-muted-foreground mb-2">Yorum yapabilmek için filmi "İzlendi" olarak işaretlemelisiniz.</p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-muted-foreground italic">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="p-5 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-foreground flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                            {comment.anonymous_name.substring(0, 2).toUpperCase()}
                          </div>
                          {comment.anonymous_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Stats */}
          <div className="space-y-6">
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm sticky top-24">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Topluluk İstatistikleri
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-secondary/40 rounded-lg">
                  <span className="text-muted-foreground font-medium">Toplam İzleyen</span>
                  <span className="font-bold text-lg">{watchers.filter((w: any) => w.status === 'watched').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/40 rounded-lg">
                  <span className="text-muted-foreground font-medium">İzlemek İsteyen</span>
                  <span className="font-bold text-lg">{watchers.filter((w: any) => w.status === 'want_to_watch').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/40 rounded-lg">
                  <span className="text-muted-foreground font-medium">Yorum Sayısı</span>
                  <span className="font-bold text-lg">{comments.length}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
