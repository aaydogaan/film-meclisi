import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRecommendations, markRecommendationAsWatched, deleteRecommendation } from '@/app/actions/movies'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clapperboard, Eye, Trash2 } from 'lucide-react'

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const recommendations = await getRecommendations(user.id)

  return (
    <div className="min-h-svh bg-background">
      <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Önerilen Filmler
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Arkadaşlarının sana önerdiği filmler
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Clapperboard className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-foreground">Henüz öneri yok</p>
              <p className="text-sm text-muted-foreground">
                Arkadaşların sana film önerdiğinde burada görünecek.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec: any) => (
              <div key={rec.id} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex gap-4">
                  {rec.movies?.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rec.movies.poster_url}
                      alt={rec.movies.title}
                      className="w-20 h-28 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-28 bg-secondary rounded flex items-center justify-center text-muted-foreground">
                      <Clapperboard className="h-8 w-8" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{rec.movies?.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {rec.movies?.year} · {rec.movies?.genre}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Öneren: {rec.profiles?.name || rec.profiles?.email || 'Bilinmiyor'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {rec.watched ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          İzlendi
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          İzlenmedi
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {!rec.watched && (
                    <form action={markRecommendationAsWatched.bind(null, rec.id)}>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        İzledim
                      </Button>
                    </form>
                  )}
                  <form action={deleteRecommendation.bind(null, rec.id)}>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
