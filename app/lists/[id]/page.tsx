import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMovieListById, deleteMovieList, removeMovieFromList } from '@/app/actions/movies'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Clapperboard, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const list = await getMovieListById(parseInt(id))

  if (!list) {
    return (
      <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
        <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Liste bulunamadı</p>
            <Link href="/lists">
              <Button className="mt-4">Listelere dön</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <Link href="/lists">
            <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Listelere dön
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{list.name}</h1>
              {list.description && (
                <p className="mt-2 text-muted-foreground">{list.description}</p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {list.movie_list_items?.length || 0} film
              </p>
            </div>
            <form action={deleteMovieList.bind(null, list.id)}>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Listeyi Sil
              </Button>
            </form>
          </div>
        </div>

        {list.movie_list_items?.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-border bg-card/30 text-center">
            <Clapperboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Bu listede henüz film yok</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.movie_list_items?.map((item: any) => (
              <div key={item.id} className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors flex gap-4">
                {item.movies?.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.movies.poster_url}
                    alt={item.movies.title}
                    className="w-20 h-28 object-cover rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-28 bg-secondary/50 rounded-lg flex items-center justify-center text-muted-foreground">
                    <Clapperboard className="h-8 w-8" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-1">{item.movies?.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.movies?.year} · {item.movies?.genre}
                  </p>
                  <form action={removeMovieFromList.bind(null, list.id, item.movies.id)} className="mt-2">
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-8 px-2">
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
