import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMovies } from '@/app/actions/movies'
import { AppHeader } from '@/components/app-header'
import { MovieLibrary } from '@/components/movie-library'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const movies = await getMovies()

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <MovieLibrary movies={movies} currentUser={user} />
      </main>
    </div>
  )
}
