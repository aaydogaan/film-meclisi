'use client'

import { useMemo } from 'react'
import { Film, Star, Heart, Bookmark } from 'lucide-react'

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  )
}

export function StatsOverview({ movies }: { movies: any[] }) {
  const stats = useMemo(() => {
    const watched = movies.filter((m) => m.status === 'watched')
    const watchlist = movies.filter((m) => m.status === 'watchlist')
    const favorites = movies.filter((m) => m.favorite)
    const rated = watched.filter((m) => (m.rating ?? 0) > 0)
    const avg =
      rated.length > 0
        ? rated.reduce((sum, m) => sum + (m.rating ?? 0), 0) / rated.length
        : 0

    const genreCounts = new Map<string, number>()
    for (const m of watched) {
      if (m.genre) genreCounts.set(m.genre, (genreCounts.get(m.genre) ?? 0) + 1)
    }
    let topGenre = '—'
    let topCount = 0
    for (const [g, c] of genreCounts) {
      if (c > topCount) {
        topCount = c
        topGenre = g
      }
    }

    return {
      watchedCount: watched.length,
      watchlistCount: watchlist.length,
      favoritesCount: favorites.length,
      avg,
      topGenre,
    }
  }, [movies])

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={<Film className="h-4 w-4" />}
        label="İzlenen"
        value={String(stats.watchedCount)}
        hint="film"
      />
      <StatCard
        icon={<Star className="h-4 w-4" />}
        label="Ortalama Puan"
        value={stats.avg > 0 ? stats.avg.toFixed(1) : '—'}
        hint={stats.avg > 0 ? '/ 10' : undefined}
      />
      <StatCard
        icon={<Heart className="h-4 w-4" />}
        label="Favori"
        value={String(stats.favoritesCount)}
      />
      <StatCard
        icon={<Bookmark className="h-4 w-4" />}
        label="İzlenecek"
        value={String(stats.watchlistCount)}
        hint={stats.topGenre !== '—' ? `Favori tür: ${stats.topGenre}` : undefined}
      />
    </div>
  )
}
