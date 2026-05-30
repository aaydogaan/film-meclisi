'use client'

import { useMemo, useState } from 'react'
import { Plus, Search, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MovieCard } from '@/components/movie-card'
import { MovieDialog } from '@/components/movie-dialog'

export function MovieLibrary({ movies, currentUser }: { movies: any[]; currentUser: any }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('all')

  const genres = useMemo(() => {
    const set = new Set<string>()
    for (const m of movies) if (m.genre) set.add(m.genre)
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'))
  }, [movies])

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr')
    return movies.filter((m) => {
      if (genre !== 'all' && m.genre !== genre) return false
      if (q) {
        const haystack = [m.title, m.director, m.genre]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('tr')
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [movies, genre, search])

  const openAdd = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (movie: any) => {
    setEditing(movie)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Filmler</h2>
          <Button onClick={openAdd} className="sm:w-auto">
            <Plus className="h-4 w-4" />
            Film ekle
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Film, yönetmen ya da tür ara..."
              className="pl-9"
            />
          </div>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm türler</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onEdit={openEdit} currentUser={currentUser} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {movies.length === 0 ? 'Henüz film eklemedin' : 'Sonuç bulunamadı'}
            </p>
            <p className="text-sm text-muted-foreground">
              {movies.length === 0
                ? 'İlk filmini ekleyerek günlüğünü oluşturmaya başla.'
                : 'Farklı bir filtre ya da arama dene.'}
            </p>
          </div>
          {movies.length === 0 && (
            <Button onClick={openAdd} variant="outline">
              <Plus className="h-4 w-4" />
              Film ekle
            </Button>
          )}
        </div>
      )}

      <MovieDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        movie={editing}
      />
    </div>
  )
}
