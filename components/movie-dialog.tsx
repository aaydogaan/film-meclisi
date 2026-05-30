'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GENRES } from '@/lib/genres'
import { updateMovie, addMovieWithStatus, checkIfUserHasMovie, type MovieInput } from '@/app/actions/movies'
import { createClient } from '@/lib/supabase/client'

type MovieDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  movie?: any | null
}

type TMDBMovie = {
  id: number
  title: string
  release_date: string
  poster_path: string | null
}

export function MovieDialog({ open, onOpenChange, movie }: MovieDialogProps) {
  const router = useRouter()
  const isEdit = Boolean(movie)

  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [director, setDirector] = useState('')
  const [genre, setGenre] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(!isEdit)
  const [status, setStatus] = useState<'watched' | 'want_to_watch'>('watched')
  const [rating, setRating] = useState<number>(7)
  const [comment, setComment] = useState('')

  const [syncedId, setSyncedId] = useState<number | 'new' | null>(null)
  const currentKey = movie?.id ?? 'new'
  if (open && syncedId !== currentKey) {
    setSyncedId(currentKey)
    setTitle(movie?.title ?? '')
    setYear(movie?.year ? String(movie.year) : '')
    setDirector(movie?.director ?? '')
    setGenre(movie?.genre ?? '')
    setPosterUrl(movie?.poster_url ?? '')
    setError(null)
    setShowSearch(!isEdit)
    setStatus('watched')
    setRating(7)
    setComment('')
  }
  if (!open && syncedId !== null) {
    setSyncedId(null)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setError(null)
    
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&language=tr-TR`
      )
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results)
      } else {
        setError('Film bulunamadı')
        setSearchResults([])
      }
    } catch {
      setError('Arama başarısız')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const selectMovie = async (tmdbMovie: TMDBMovie) => {
    setSearching(true)
    setError(null)
    try {
      // Önce kütüphanede var mı kontrol et
      const releaseYear = tmdbMovie.release_date ? Number(tmdbMovie.release_date.substring(0,4)) : null
      const hasMovie = await checkIfUserHasMovie(tmdbMovie.title, releaseYear)
      if (hasMovie) {
        setError('Bu film zaten kütüphanenizde bulunuyor.')
        return
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbMovie.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=credits&language=tr-TR`
      )
      const data = await response.json()
      
      setTitle(data.title)
      setYear(data.release_date ? data.release_date.substring(0, 4) : '')
      
      const directorName = data.credits?.crew?.find((c: any) => c.job === 'Director')?.name || ''
      setDirector(directorName)
      
      setGenre(data.genres?.[0]?.name || '')
      setPosterUrl(data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '')
      setShowSearch(false)
      setSearchQuery('')
      setSearchResults([])
    } catch {
      setError('Detaylar alınamadı veya film zaten ekli')
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Film adı gerekli')
      return
    }
    setSaving(true)
    setError(null)

    const payload: MovieInput = {
      title,
      year: year ? Number(year) : null,
      director,
      genre: genre || null,
      posterUrl,
    }

    try {
      if (isEdit && movie) {
        await updateMovie(movie.id, payload)
      } else {
        await addMovieWithStatus(
          payload,
          status,
          status === 'watched' ? rating : undefined,
          status === 'watched' ? comment.trim() || undefined : undefined
        )
      }

      onOpenChange(false)
      router.refresh()
    } catch {
      setError('Kaydedilemedi, lütfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Filmi düzenle' : 'Film ekle'}</DialogTitle>
          <DialogDescription>
            {!isEdit && showSearch ? 'IMDb\'den film ara veya manuel gir.' : 'Film bilgilerini gir.'}
          </DialogDescription>
        </DialogHeader>

        {!isEdit && showSearch ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Film adı ara..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            {searchResults.length > 0 && (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => selectMovie(result)}
                    className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                  >
                    {result.poster_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://image.tmdb.org/t/p/w200${result.poster_path}`}
                        alt={result.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-secondary rounded flex items-center justify-center text-muted-foreground text-xs">
                        No poster
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground">{result.release_date ? result.release_date.substring(0, 4) : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSearch(false)}
              className="w-full"
            >
              Manuel giriş
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSearch(true)}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                IMDb'den ara
              </Button>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Film adı *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn. Inception"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="year">Yıl</Label>
                <Input
                  id="year"
                  type="number"
                  inputMode="numeric"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2010"
                  min={1888}
                  max={2100}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="genre">Tür</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger id="genre">
                    <SelectValue placeholder="Seç" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="director">Yönetmen</Label>
              <Input
                id="director"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="Örn. Christopher Nolan"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="poster">Poster URL (opsiyonel)</Label>
              <Input
                id="poster"
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {!isEdit && (
              <div className="border-t border-border pt-4 mt-2 space-y-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold">İzleme Durumu</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={status === 'watched' ? 'default' : 'outline'}
                      onClick={() => setStatus('watched')}
                      className="w-full h-9 rounded-xl transition-all"
                    >
                      İzledim
                    </Button>
                    <Button
                      type="button"
                      variant={status === 'want_to_watch' ? 'default' : 'outline'}
                      onClick={() => setStatus('want_to_watch')}
                      className="w-full h-9 rounded-xl transition-all"
                    >
                      İzleyeceğim
                    </Button>
                  </div>
                </div>

                {status === 'watched' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-semibold">Puanım (1-10)</Label>
                      <div className="flex flex-wrap gap-1.5 justify-between">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setRating(num)}
                            className={`h-8 w-8 rounded-lg text-xs font-bold transition-all border ${
                              rating === num
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-110'
                                : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="comment" className="text-sm font-semibold">Yorum / İnceleme (opsiyonel)</Label>
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Film hakkındaki düşünceleriniz..."
                        rows={3}
                        className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
