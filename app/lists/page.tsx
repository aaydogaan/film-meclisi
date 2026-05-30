import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMovieLists, createMovieList, deleteMovieList } from '@/app/actions/movies'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ListPlus, Trash2, Clapperboard } from 'lucide-react'
import Link from 'next/link'

export default async function ListsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const lists = await getMovieLists(user.id)

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Film Listeleri</h1>
            <p className="mt-2 text-muted-foreground">
              Kendi film listelerini oluştur ve yönet
            </p>
          </div>
          <CreateListDialog />
        </div>

        {lists.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-border bg-card/30 text-center">
            <ListPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">Henüz film listeniz yok</p>
            <CreateListDialog />
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <CreateListDialog />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lists.map((list: any) => (
                <Link key={list.id} href={`/lists/${list.id}`}>
                  <div className="p-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-indigo-500/40 hover:bg-card/85 hover:shadow-lg transition-all h-full flex flex-col cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-indigo-500 transition-colors">{list.name}</h3>
                        {list.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 flex -space-x-2 overflow-hidden items-end">
                      {list.movie_list_items?.slice(0, 5).map((item: any, i: number) => (
                        <div key={i} className="inline-block h-12 w-8 rounded-md border-2 border-background bg-secondary overflow-hidden relative z-10 shrink-0 shadow-sm">
                          {item.movies?.poster_url ? (
                            <img src={item.movies.poster_url} alt="poster" className="h-full w-full object-cover" />
                          ) : (
                            <Clapperboard className="h-4 w-4 m-1.5 opacity-50" />
                          )}
                        </div>
                      ))}
                      {list.movie_list_items?.length === 0 && (
                        <span className="text-xs text-muted-foreground">Henüz film eklenmemiş</span>
                      )}
                      {(list.movie_list_items?.length || 0) > 5 && (
                        <div className="inline-flex h-12 w-8 items-center justify-center rounded-md border-2 border-background bg-muted text-xs font-bold z-10">
                          +{(list.movie_list_items?.length || 0) - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function CreateListDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <ListPlus className="h-4 w-4 mr-2" />
          Yeni Liste
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Liste Oluştur</DialogTitle>
        </DialogHeader>
        <form action={createMovieList} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Liste Adı</Label>
            <Input id="name" name="name" placeholder="Örn: Korku Filmleri" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Açıklama (isteğe bağlı)</Label>
            <Textarea id="description" name="description" placeholder="Bu liste hakkında..." rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit">Oluştur</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
