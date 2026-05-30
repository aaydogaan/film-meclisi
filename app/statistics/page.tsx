import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserStatistics } from '@/app/actions/movies'
import { AppHeader } from '@/components/app-header'
import { BarChart3, Film, MessageSquare, Star, TrendingUp } from 'lucide-react'

export default async function StatisticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  let stats
  try {
    stats = await getUserStatistics(user.id)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    stats = {
      totalWatched: 0,
      totalComments: 0,
      genreStats: {},
      yearStats: {},
      monthlyStats: {},
      avgRating: 0,
    }
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">İstatistikler</h1>
          <p className="mt-2 text-muted-foreground">
            İzleme alışkanlıklarınızı inceleyin
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Film className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">İzlenen Film</span>
            </div>
            <p className="text-4xl font-bold">{stats.totalWatched}</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Yorum</span>
            </div>
            <p className="text-4xl font-bold">{stats.totalComments}</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Ortalama Puan</span>
            </div>
            <p className="text-4xl font-bold">{stats.avgRating}</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Tür Sayısı</span>
            </div>
            <p className="text-4xl font-bold">{Object.keys(stats.genreStats).length}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              Tür Dağılımı
            </h2>
            {Object.keys(stats.genreStats).length === 0 ? (
              <div className="p-12 rounded-2xl border border-dashed border-border bg-card/30 text-center">
                <p className="text-muted-foreground">Henüz veri yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.genreStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([genre, count]) => (
                    <div key={genre} className="flex items-center gap-4">
                      <span className="w-24 text-sm text-muted-foreground truncate">{genre}</span>
                      <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(count / stats.totalWatched) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              Yıllık Dağılım
            </h2>
            {Object.keys(stats.yearStats).length === 0 ? (
              <div className="p-12 rounded-2xl border border-dashed border-border bg-card/30 text-center">
                <p className="text-muted-foreground">Henüz veri yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.yearStats)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([year, count]) => (
                    <div key={year} className="flex items-center gap-4">
                      <span className="w-24 text-sm text-muted-foreground">{year}</span>
                      <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(count / stats.totalWatched) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {Object.keys(stats.monthlyStats).length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              Aylık İzleme
            </h2>
            <div className="space-y-3">
              {Object.entries(stats.monthlyStats)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .slice(0, 6)
                .map(([month, count]) => (
                  <div key={month} className="flex items-center gap-4">
                    <span className="w-32 text-sm text-muted-foreground">{month}</span>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(count / Math.max(...Object.values(stats.monthlyStats))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
