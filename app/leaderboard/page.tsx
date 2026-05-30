import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLeaderboard } from '@/app/actions/movies'
import { AppHeader } from '@/components/app-header'
import { Trophy, Eye, MessageSquare, Crown } from 'lucide-react'
import Link from 'next/link'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const leaderboard = await getLeaderboard()

  const medalColors = [
    'from-amber-400/20 to-yellow-500/5 border-amber-400/30 hover:border-amber-400/50 shadow-amber-500/5',
    'from-slate-300/20 to-slate-400/5 border-slate-300/30 hover:border-slate-300/50 shadow-slate-400/5',
    'from-amber-600/20 to-amber-700/5 border-amber-600/30 hover:border-amber-600/50 shadow-amber-700/5',
  ]

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/20">
      <AppHeader name={user.user_metadata?.name ?? user.email ?? ''} email={user.email ?? ''} avatarUrl={user.user_metadata?.avatar_url} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 animate-in fade-in duration-500">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shadow-inner">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
              Liderlik Tablosu
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Topluluğun en aktif film eleştirmenleri ve izleyicileri</p>
        </div>

        <div className="space-y-3">
          {leaderboard.map((entry: any, index: number) => {
            const isTop3 = index < 3
            const isCurrentUser = entry.id === user.id
            const initials = (entry.name || entry.email || '?')
              .split(' ')
              .map((p: string) => p[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('')
              .toUpperCase()

            return (
              <Link key={entry.id} href={`/users/${entry.id}`} className="block">
                <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer flex items-center gap-4 ${
                  isTop3 
                    ? `bg-gradient-to-r ${medalColors[index]} border-2` 
                    : isCurrentUser
                      ? 'bg-primary/5 border-primary/20 border-2'
                      : 'bg-card/50 border-border/80 hover:border-primary/20 backdrop-blur-sm'
                }`}>
                  {/* Rank Badge */}
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 transition-transform ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/10' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-black shadow-lg shadow-slate-400/10' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-700/10' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {index < 3 ? <Crown className="h-5 w-5 animate-pulse" /> : index + 1}
                  </div>
                  
                  {/* Profile Info */}
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold uppercase text-muted-foreground shrink-0 hidden sm:flex">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base text-foreground truncate">
                          {entry.name || 'İsimsiz'}
                          {isCurrentUser && (
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">
                              Sen
                            </span>
                          )}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{entry.email}</p>
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors" title="İzlenen Filmler">
                      <Eye className="h-4 w-4 text-primary/70" />
                      <span className="font-medium text-foreground">{entry.watchedCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors" title="Yorumlar">
                      <MessageSquare className="h-4 w-4 text-primary/70" />
                      <span className="font-medium text-foreground">{entry.commentCount}</span>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase tracking-wide">
                      {entry.totalScore} Puan
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
