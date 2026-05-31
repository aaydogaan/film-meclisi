import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserById, getUserWatchedMovies, getUserWantToWatchMovies, getUserStats, getUserTop3, getUserFavorites, getMovieLists } from '@/app/actions/movies'
import { getUserBadges } from '@/app/actions/badges'
import { AppHeader } from '@/components/app-header'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Clapperboard, Eye, EyeOff, Star, Heart, Trophy } from 'lucide-react'
import Link from 'next/link'

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) redirect('/sign-in')

  const profile = await getUserById(id)
  const watchedMovies = await getUserWatchedMovies(id)
  const wantToWatchMovies = await getUserWantToWatchMovies(id)
  const stats = await getUserStats(id)
  const top3Movies = await getUserTop3(id)
  const favoriteMovies = await getUserFavorites(id)
  const badges = await getUserBadges(id)
  const customLists = await getMovieLists(id)

  if (!profile) {
    return (
      <div className="min-h-svh bg-background">
        <AppHeader name={currentUser.user_metadata?.name ?? currentUser.email ?? ''} email={currentUser.email ?? ''} avatarUrl={currentUser.user_metadata?.avatar_url} />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Kullanıcı bulunamadı</p>
            <Link href="/users">
              <Button className="mt-4">Kullanıcı listesine dön</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      <AppHeader name={currentUser.user_metadata?.name ?? currentUser.email ?? ''} email={currentUser.email ?? ''} avatarUrl={currentUser.user_metadata?.avatar_url} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <Link href="/users">
            <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground">
              ← Kullanıcı listesine dön
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex shrink-0 items-center justify-center text-primary text-3xl font-bold shadow-lg">
              {profile.raw_user_meta_data?.avatar_url || profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.raw_user_meta_data?.avatar_url || profile.avatar_url} alt={profile.name || profile.email || 'Kullanıcı'} className="h-full w-full object-cover" />
              ) : (
                (profile.name || profile.email || 'U')[0].toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{profile.name || 'İsimsiz'}</h1>
              <p className="text-muted-foreground mt-1">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          <div className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">İzlenen Film</span>
            </div>
            <p className="text-4xl font-bold">{stats.watchedCount}</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <EyeOff className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">İzleyecek</span>
            </div>
            <p className="text-4xl font-bold">{wantToWatchMovies.length}</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Yorum</span>
            </div>
            <p className="text-4xl font-bold">{stats.commentCount}</p>
          </div>
        </div>
        {/* Rozetler */}
        {badges && badges.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="h-4.5 w-4.5 text-primary" />
              </div>
              Rozetler
            </h2>
            <TooltipProvider>
              <div className="flex flex-wrap gap-3">
                {badges.map(badge => (
                  <Tooltip key={badge.id} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div 
                        suppressHydrationWarning
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm cursor-help transition-all ${
                          badge.is_earned 
                            ? `${badge.color} bg-opacity-10 backdrop-blur-sm` 
                            : 'bg-secondary/30 border-border/50 text-muted-foreground/50 grayscale hover:grayscale-0'
                        }`} 
                      >
                        <span suppressHydrationWarning className={`text-lg ${!badge.is_earned ? 'opacity-50' : ''}`}>{badge.icon}</span>
                        <span suppressHydrationWarning className={`font-semibold text-sm ${!badge.is_earned ? 'opacity-70' : ''}`}>{badge.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-popover text-popover-foreground border shadow-md font-medium">
                      <p>{badge.is_earned ? badge.description : `Kilitli: ${badge.description}`}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}

        {/* Özel Listeler */}
        {customLists && customLists.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <span className="text-indigo-500 font-bold text-lg">☰</span>
              </div>
              Özel Listeler
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {customLists.map((list: any) => (
                <Link key={list.id} href={`/lists/${list.id}`} className="block group">
                  <div className="p-4 rounded-2xl border border-border bg-card/40 hover:bg-card/85 hover:border-indigo-500/30 hover:shadow-md transition-all h-full flex flex-col">
                    <h3 className="font-bold text-lg truncate group-hover:text-indigo-500 transition-colors mb-2">{list.name}</h3>
                    {list.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{list.description}</p>}
                    
                    <div className="mt-auto flex -space-x-2 overflow-hidden">
                      {list.movie_list_items?.slice(0, 5).map((item: any, i: number) => (
                        <div key={i} className="inline-block h-8 w-6 rounded border-2 border-background bg-secondary overflow-hidden relative z-10 shrink-0">
                          {item.movies?.poster_url ? (
                            <img src={item.movies.poster_url} alt="poster" className="h-full w-full object-cover" />
                          ) : (
                            <Clapperboard className="h-3 w-3 m-1 opacity-50" />
                          )}
                        </div>
                      ))}
                      {list.movie_list_items?.length === 0 && (
                        <span className="text-xs text-muted-foreground">Boş liste</span>
                      )}
                      {(list.movie_list_items?.length || 0) > 5 && (
                        <div className="inline-flex h-8 w-6 items-center justify-center rounded border-2 border-background bg-muted text-[10px] font-medium z-10">
                          +{(list.movie_list_items?.length || 0) - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* İlk 3 Film */}
        {top3Movies.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2.5 text-yellow-500">
              <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Trophy className="h-4.5 w-4.5" />
              </div>
              İlk 3 Filmi
            </h2>
            <div className="flex flex-wrap gap-4">
              {top3Movies.map((item: any, index: number) => (
                <Link key={item.id} href={`/movies/${item.movie_id}`} className="block">
                  <div className="relative group p-3 rounded-xl border border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-transparent hover:border-yellow-500/40 hover:scale-[1.02] transition-all flex items-center gap-3 w-64 max-w-full">
                    <div className="absolute -top-2.5 -left-2.5 h-6 w-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                      {index + 1}
                    </div>
                    {item.movies?.poster_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.movies.poster_url}
                        alt={item.movies.title}
                        className="w-12 h-18 object-cover rounded-lg shadow-sm shrink-0 border border-border/50"
                      />
                    ) : (
                      <div className="w-12 h-18 bg-secondary/50 rounded-lg flex items-center justify-center text-muted-foreground shrink-0">
                        <Clapperboard className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors">{item.movies?.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.movies?.year} · {item.movies?.genre}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Favori Filmler */}
        {favoriteMovies.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2.5 text-red-500">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Heart className="h-4 w-4" />
              </div>
              Favori Filmleri
            </h2>
            <div className="flex flex-wrap gap-3">
              {favoriteMovies.map((item: any) => (
                <Link key={item.id} href={`/movies/${item.movie_id}`} className="block group">
                  <div className="relative rounded-lg overflow-hidden border border-border/80 w-16 sm:w-20 hover:border-primary/50 transition-all hover:scale-[1.03]">
                    {item.movies?.poster_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.movies.poster_url}
                        alt={item.movies.title}
                        className="w-full aspect-[2/3] object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-secondary/50 flex items-center justify-center text-muted-foreground">
                        <Clapperboard className="h-6 w-6" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <p className="text-[9px] text-white line-clamp-2 text-center w-full leading-tight font-medium">
                        {item.movies?.title}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* İzlenen Filmler */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="h-4 w-4 text-primary" />
              </div>
              İzlenen Filmler
            </h2>
            {watchedMovies.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border bg-card/30 text-center text-sm">
                <Clapperboard className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground">Henüz izlenen film yok</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {watchedMovies.map((item: any) => (
                  <Link key={item.id} href={`/movies/${item.movie_id}`} className="block">
                    <div className="p-2.5 rounded-xl border border-border bg-card/40 hover:bg-card/85 hover:border-primary/20 transition-all flex gap-3 cursor-pointer items-center">
                      {item.movies?.poster_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.movies.poster_url}
                          alt={item.movies.title}
                          className="w-10 h-14 object-cover rounded-lg shadow-sm border border-border/50 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-secondary/50 rounded-lg flex items-center justify-center text-muted-foreground shrink-0 border border-border/50">
                          <Clapperboard className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate text-foreground hover:text-primary transition-colors">{item.movies?.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.movies?.year} · {item.movies?.genre}
                        </p>
                      </div>
                      {item.rating && (
                        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-lg shrink-0">
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{item.rating}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* İzleyecek Filmler */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <EyeOff className="h-4 w-4 text-primary" />
              </div>
              İzleyecek Filmler
            </h2>
            {wantToWatchMovies.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border bg-card/30 text-center text-sm">
                <Clapperboard className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground">Henüz izlenecek film yok</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {wantToWatchMovies.map((item: any) => (
                  <Link key={item.id} href={`/movies/${item.movie_id}`} className="block">
                    <div className="p-2.5 rounded-xl border border-border bg-card/40 hover:bg-card/85 hover:border-primary/20 transition-all flex gap-3 cursor-pointer items-center">
                      {item.movies?.poster_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.movies.poster_url}
                          alt={item.movies.title}
                          className="w-10 h-14 object-cover rounded-lg shadow-sm border border-border/50 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-secondary/50 rounded-lg flex items-center justify-center text-muted-foreground shrink-0 border border-border/50">
                          <Clapperboard className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate text-foreground hover:text-primary transition-colors">{item.movies?.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.movies?.year} · {item.movies?.genre}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
