import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAllUsers, getAllUserStats } from '@/app/actions/movies'
import { AppHeader } from '@/components/app-header'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const users = await getAllUsers()
  
  const userIds = users.map(u => u.id)
  const statsMap = await getAllUserStats(userIds)
  
  const usersWithStats = users.map(u => ({
    ...u,
    stats: statsMap.get(u.id) || { watchedCount: 0, commentCount: 0 }
  }))

  // Giriş yapmış kullanıcıyı listenin en başına alıyoruz
  const sortedUsersWithStats = [...usersWithStats].sort((a, b) => {
    if (a.id === user.id) return -1
    if (b.id === user.id) return 1
    return 0
  })

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Kullanıcılar
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kayıtlı tüm kullanıcılar ve istatistikleri
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedUsersWithStats.map((u) => {
            const isCurrentUser = u.id === user.id
            return (
              <Link key={u.id} href={`/users/${u.id}`}>
                <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg cursor-pointer ${
                  isCurrentUser
                    ? 'border-primary/30 bg-primary/5 shadow-md shadow-primary/5 hover:border-primary/50'
                    : 'border-border bg-card/50 backdrop-blur-sm hover:border-primary/40'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`relative h-14 w-14 rounded-xl overflow-hidden shadow-sm flex shrink-0 items-center justify-center text-xl font-bold ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary'
                    }`}>
                      {u.raw_user_meta_data?.avatar_url || u.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.raw_user_meta_data?.avatar_url || u.avatar_url} alt={u.name || u.email || 'Kullanıcı'} className="h-full w-full object-cover" />
                      ) : (
                        (u.name || u.email || 'U')[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base flex items-center truncate">
                        {u.name || 'İsimsiz'}
                        {isCurrentUser && (
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">
                            Sen
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl ${isCurrentUser ? 'bg-background/80' : 'bg-secondary/50'}`}>
                      <p className="text-xs text-muted-foreground mb-1">İzlenen Film</p>
                      <p className="text-2xl font-bold">{u.stats.watchedCount}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${isCurrentUser ? 'bg-background/80' : 'bg-secondary/50'}`}>
                      <p className="text-xs text-muted-foreground mb-1">Yorum</p>
                      <p className="text-2xl font-bold">{u.stats.commentCount}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
