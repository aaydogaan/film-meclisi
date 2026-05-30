'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, Heart, Trophy } from 'lucide-react'
import { toggleFavorite, toggleTop3, addMovieWatcher } from '@/app/actions/movies'
import { useToast } from '@/components/ui/use-toast'
import { RecommendDialog } from '@/components/recommend-dialog'

export function MovieActions({ 
  movieId, 
  initialFavorite, 
  initialTop3,
  movieTitle,
  users,
  hasWatched
}: { 
  movieId: number
  initialFavorite: boolean
  initialTop3: boolean
  movieTitle: string
  users: any[]
  hasWatched: boolean
}) {
  const [isFav, setIsFav] = useState(initialFavorite)
  const [isTop, setIsTop] = useState(initialTop3)
  const [isWatched, setIsWatched] = useState(hasWatched)
  const [loadingFav, setLoadingFav] = useState(false)
  const [loadingTop, setLoadingTop] = useState(false)
  const [loadingWatched, setLoadingWatched] = useState(false)
  const { toast } = useToast()

  const handleWatched = async () => {
    setLoadingWatched(true)
    try {
      await addMovieWatcher(movieId, 'watched')
      setIsWatched(true)
      toast({ title: 'Başarılı', description: 'Film izlendi olarak işaretlendi.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Hata', description: err.message })
    } finally {
      setLoadingWatched(false)
    }
  }

  const handleFav = async () => {
    setLoadingFav(true)
    try {
      await toggleFavorite(movieId, !isFav)
      setIsFav(!isFav)
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Hata', description: err.message })
    } finally {
      setLoadingFav(false)
    }
  }

  const handleTop = async () => {
    setLoadingTop(true)
    try {
      await toggleTop3(movieId, !isTop)
      setIsTop(!isTop)
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Hata', description: err.message })
    } finally {
      setLoadingTop(false)
    }
  }

  return (
    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-4">
      {!isWatched && (
        <Button 
          onClick={handleWatched}
          disabled={loadingWatched}
          variant="secondary" 
          size="lg"
          className="font-semibold bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
        >
          <Eye className="mr-2 h-5 w-5" />
          İzledim
        </Button>
      )}

      <Button 
        onClick={handleFav}
        disabled={loadingFav}
        variant={isFav ? "default" : "secondary"} 
        size="lg"
        className={`font-semibold ${isFav ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md'}`}
      >
        <Heart className={`mr-2 h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
        {isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
      </Button>

      <Button 
        onClick={handleTop}
        disabled={loadingTop}
        variant={isTop ? "default" : "secondary"} 
        size="lg"
        className={`font-semibold ${isTop ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md'}`}
      >
        <Trophy className={`mr-2 h-5 w-5 ${isTop ? 'fill-current' : ''}`} />
        {isTop ? "İlk 3'ten Çıkar" : "İlk 3'e Ekle"}
      </Button>

      <RecommendDialog 
        movieId={movieId} 
        movieTitle={movieTitle} 
        users={users} 
        hasWatched={isWatched}
      />
    </div>
  )
}
