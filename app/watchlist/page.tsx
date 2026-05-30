import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserWantToWatchMovies, removeMovieWatcher } from '@/app/actions/movies'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Clapperboard, Trash2, Clock, Eye } from 'lucide-react'
import Link from 'next/link'

export default async function WatchlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const wantToWatchList = await getUserWantToWatchMovies(user.id)

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 animate-in fade-in duration-500">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">İlk İzlenecekler</h1>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            Daha sonra izlemek üzere kaydettiğiniz filmler
          </p>
        </div>

        {wantToWatchList.length === 0 ? (
          <div className="p-16 rounded-3xl border border-dashed border-border bg-card/30 text-center backdrop-blur-sm">
            <Clapperboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40 animate-pulse" />
            <p className="text-lg font-medium text-foreground mb-1">Listenizde Henüz Film Yok</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Film eklerken izleme durumunu <strong>"İzleyeceğim"</strong> olarak seçin.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wantToWatchList.map((item: any) => (
              <div key={item.id} className="group relative p-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-card/80 transition-all duration-300 flex gap-4">
                {/* Poster Link */}
                <Link href={`/movies/${item.movies.id}`} className="shrink-0">
                  {item.movies?.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.movies.poster_url}
                      alt={item.movies.title}
                      className="w-20 h-28 object-cover rounded-xl shadow-sm border border-border/50 group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-20 h-28 bg-muted rounded-xl flex items-center justify-center text-muted-foreground border border-border/50">
                      <Clapperboard className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link href={`/movies/${item.movies.id}`} className="hover:text-primary transition-colors block">
                      <h3 className="font-semibold text-base mb-1 truncate">{item.movies?.title}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {item.movies?.year} · {item.movies?.genre}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Link href={`/movies/${item.movies.id}`} className="inline-flex items-center text-xs text-muted-foreground hover:text-primary font-medium transition-colors">
                      <Eye className="h-3.5 w-3.5 mr-1" /> Detaylar
                    </Link>
                    
                    <span className="text-muted-foreground/30 text-xs">•</span>

                    <form action={removeMovieWatcher.bind(null, item.movies.id)}>
                      <Button 
                        type="submit" 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Kaldır
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
