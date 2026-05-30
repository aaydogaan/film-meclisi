import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMovieRankings } from '@/app/actions/movies'
import { AppHeader } from '@/components/app-header'
import { Star, Clapperboard } from 'lucide-react'
import Link from 'next/link'

export default async function RankingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const rankings = await getMovieRankings()

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 animate-in fade-in duration-500">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shadow-inner">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500/20" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
              Film Sıralaması
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Kullanıcı puanlarına göre en beğenilen filmler</p>
        </div>

        {rankings.length === 0 ? (
          <div className="p-16 rounded-3xl border border-dashed border-border bg-card/30 text-center backdrop-blur-sm">
            <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40 animate-pulse" />
            <p className="text-lg font-medium text-foreground mb-1">Henüz Puanlanmış Film Yok</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Sıralamanın oluşması için filmleri izledim olarak işaretleyip 1-10 arası puan verin.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rankings.map((movie: any, index: number) => {
              const ratingColor = 
                movie.avgRating >= 8 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                movie.avgRating >= 6 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                movie.avgRating >= 4 ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' :
                'text-red-500 bg-red-500/10 border-red-500/20'

              return (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="block">
                  <div className="p-4 rounded-2xl border border-border bg-card/50 hover:border-primary/30 hover:bg-card/85 hover:shadow-md transition-all duration-300 flex items-center gap-4 cursor-pointer backdrop-blur-sm">
                    {/* Rank Number */}
                    <div className="w-8 text-center shrink-0">
                      <span className={`text-lg font-extrabold ${
                        index === 0 ? 'text-yellow-500 text-xl' :
                        index === 1 ? 'text-slate-400' :
                        index === 2 ? 'text-amber-700' :
                        'text-muted-foreground/60'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    
                    {/* Movie Poster */}
                    {movie.poster_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded-xl shadow-sm border border-border/50 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-muted/80 rounded-xl flex items-center justify-center text-muted-foreground/60 shrink-0 border border-border/50">
                        <Clapperboard className="h-5 w-5" />
                      </div>
                    )}
                    
                    {/* Title & Meta */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-foreground truncate hover:text-primary transition-colors">
                        {movie.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {[movie.year, movie.genre, movie.director].filter(Boolean).join(' · ')}
                      </p>
                    </div>

                    {/* Rating Info */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className={`px-2.5 py-0.5 rounded-lg border text-sm font-bold ${ratingColor}`}>
                            {movie.avgRating}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium mt-1">
                          {movie.ratingCount} oy
                        </div>
                      </div>
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
