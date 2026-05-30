import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMovies, getRecentActivities } from '@/app/actions/movies'
import { AppHeader } from '@/components/app-header'
import { MovieLibrary } from '@/components/movie-library'
import { MessageSquare, Share2, Eye, Star } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const movies = await getMovies()
  const activities = await getRecentActivities(5)

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Merhaba, {(user.user_metadata?.name ?? user.email ?? '').split(' ')[0]}
          </h1>
          <p className="mt-2 text-muted-foreground">
            İzlediğin filmleri kaydet, puanla ve hakkında not al.
          </p>
        </div>

        {activities.length > 0 && (
          <div className="mb-8 p-4 rounded-xl border border-border bg-card/40 backdrop-blur-sm max-w-3xl">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">⚡</span> Son İşlemler
            </h2>
            <div className="space-y-2">
              {activities.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  {activity.type === 'comment' && <MessageSquare className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />}
                  {activity.type === 'recommendation' && <Share2 className="h-3.5 w-3.5 shrink-0 text-pink-500 mt-0.5" />}
                  {activity.type === 'watch' && (
                    activity.rating ? <Star className="h-3.5 w-3.5 shrink-0 text-yellow-500 mt-0.5" /> : <Eye className="h-3.5 w-3.5 shrink-0 text-blue-500 mt-0.5" />
                  )}
                  <p className="leading-snug">
                    <span className="text-foreground font-medium">{activity.user}</span>{' '}
                    {activity.action === 'yorum yaptı' && (
                      <><strong>{activity.movie_title}</strong> filmine yorum yaptı.</>
                    )}
                    {activity.action === 'şu filmi önerdi' && (
                      <><strong>{activity.movie_title}</strong> filmini <strong>{activity.to}</strong> kullanıcısına önerdi.</>
                    )}
                    {activity.action === 'şu filmi izledi' && (
                      <><strong>{activity.movie_title}</strong> filmini izledi{activity.rating ? ` ve ${activity.rating}/10 puan verdi` : ''}.</>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <MovieLibrary movies={movies} currentUser={user} />
      </main>
    </div>
  )
}
