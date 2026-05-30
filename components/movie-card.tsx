'use client'

import { useState, useTransition, useEffect } from 'react'
import { MoreVertical, Pencil, Trash2, Clapperboard, Star, Eye, EyeOff, MessageSquare, Share2, ListPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { deleteMovie, addMovieWatcher, addMovieComment, getMovieComments, addRecommendation, getMovieLists, addMovieToList } from '@/app/actions/movies'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

type MovieCardProps = {
  movie: any
  onEdit: (movie: any) => void
  currentUser: any
}

const ANONYMOUS_NAMES = []

function getRandomAnonymousName() {
  return ''
}

export function MovieCard({ movie, onEdit, currentUser }: MovieCardProps) {
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [watcherDialogOpen, setWatcherDialogOpen] = useState(false)
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false)
  const [recommendDialogOpen, setRecommendDialogOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [initialRating, setInitialRating] = useState(0)
  const [comment, setComment] = useState('')
  const [anonymousName, setAnonymousName] = useState(getRandomAnonymousName())
  const [comments, setComments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [addToListDialogOpen, setAddToListDialogOpen] = useState(false)
  const [movieLists, setMovieLists] = useState<any[]>([])
  const [selectedList, setSelectedList] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasCommented, setHasCommented] = useState(false)
  const [watchStatus, setWatchStatus] = useState<string>('')
  const [imdbRating, setImdbRating] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (movie.title) {
      const yearStr = movie.year ? `&y=${movie.year}` : ''
      fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}${yearStr}&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY || 'efbf9335'}`)
        .then(res => res.json())
        .then(data => {
          if (data.imdbRating && data.imdbRating !== 'N/A') setImdbRating(data.imdbRating)
        })
        .catch(() => {})
    }
  }, [movie.title, movie.year])

  const validRatings = movie.movie_watchers?.filter((w: any) => typeof w.rating === 'number' && w.rating > 0) || []
  const averageRating = validRatings.length > 0 
    ? (validRatings.reduce((sum: number, w: any) => sum + w.rating, 0) / validRatings.length).toFixed(1)
    : null
  const totalComments = movie.movie_comments?.length || 0

  useEffect(() => {
    if (currentUser) {
      let foundComment = false
      let foundRating = 0

      // Check if we already have it from a joined query
      if (movie.movie_comments) {
        foundComment = movie.movie_comments.some((c: any) => c.user_id === currentUser.id)
        setHasCommented(foundComment)
      }
      
      if (movie.movie_watchers) {
        const watcher = movie.movie_watchers.find((w: any) => w.user_id === currentUser.id)
        if (watcher) {
          if (watcher.rating) {
            foundRating = watcher.rating
            setRating(foundRating)
            setInitialRating(foundRating)
          }
          if (watcher.status) {
            setWatchStatus(watcher.status)
          }
        }
      }

      // If neither is joined (e.g. from an older query), fallback to fetching
      if (!movie.movie_comments && !movie.movie_watchers) {
        startTransition(async () => {
          const supabase = createClient()
          const [commentsRes, watchersRes] = await Promise.all([
            supabase
              .from('movie_comments')
              .select('id')
              .eq('movie_id', movie.id)
              .eq('user_id', currentUser.id)
              .single(),
            supabase
              .from('movie_watchers')
              .select('rating, status')
              .eq('movie_id', movie.id)
              .eq('user_id', currentUser.id)
              .single()
          ])
          
          setHasCommented(!!commentsRes.data)
          if (watchersRes.data) {
            if (watchersRes.data.rating) {
              setRating(watchersRes.data.rating)
              setInitialRating(watchersRes.data.rating)
            }
            if (watchersRes.data.status) {
              setWatchStatus(watchersRes.data.status)
            }
          }
        })
      }
    }
  }, [movie.id, currentUser, movie.movie_comments, movie.movie_watchers])

  const handleCommentClick = () => {
    if (watchStatus !== 'watched') {
      toast({
        variant: 'destructive',
        title: 'İşlem Engellendi',
        description: 'Yorum yapabilmek için filmi "İzledim" olarak işaretlemelisiniz.',
      })
      return
    }
    setCommentDialogOpen(true)
  }

  const handleRecommendClick = () => {
    if (watchStatus !== 'watched') {
      toast({
        variant: 'destructive',
        title: 'İşlem Engellendi',
        description: 'İzlemediğin filmi nasıl önereceksin?',
      })
      return
    }
    setRecommendDialogOpen(true)
  }

  useEffect(() => {
    if (commentsDialogOpen) {
      startTransition(async () => {
        const data = await getMovieComments(movie.id)
        setComments(data)
      })
    }
  }, [commentsDialogOpen, movie.id])

  useEffect(() => {
    if (recommendDialogOpen) {
      startTransition(async () => {
        const response = await fetch('/api/get-users')
        const data = await response.json()
        setUsers(data.filter((u: any) => u.id !== currentUser?.id))
      })
    }
  }, [recommendDialogOpen, currentUser?.id])

  useEffect(() => {
    if (addToListDialogOpen && currentUser) {
      startTransition(async () => {
        const lists = await getMovieLists(currentUser.id)
        setMovieLists(lists)
      })
    }
  }, [addToListDialogOpen, currentUser])

  const handleDelete = () => {
    startTransition(() => deleteMovie(movie.id))
  }

  const handleMarkAsWatched = () => {
    startTransition(() => {
      addMovieWatcher(movie.id, 'watched', rating || undefined)
      if (comment.trim() && !hasCommented) {
        const defaultName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'İsimsiz'
        addMovieComment(movie.id, comment, defaultName).then(() => {
          if (commentsDialogOpen) {
            getMovieComments(movie.id).then(setComments)
          }
          setHasCommented(true)
        })
      }
      setWatcherDialogOpen(false)
      setRating(0)
      setComment('')
    })
  }

  const handleMarkAsWantToWatch = () => {
    startTransition(() => {
      addMovieWatcher(movie.id, 'want_to_watch')
      setWatcherDialogOpen(false)
    })
  }

  const handleAddComment = () => {
    if (!comment.trim()) return
    startTransition(() => {
      const defaultName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'İsimsiz'
      addMovieComment(movie.id, comment, defaultName).then(() => {
        if (commentsDialogOpen) {
          getMovieComments(movie.id).then(setComments)
          setHasCommented(true)
        }
      })
      setCommentDialogOpen(false)
      setComment('')
    })
  }

  const handleRecommend = () => {
    if (!selectedUser) return
    startTransition(async () => {
      try {
        await addRecommendation(movie.id, selectedUser)
        setRecommendDialogOpen(false)
        setSelectedUser('')
      } catch {
        alert('Öneri başarısız')
      }
    })
  }

  const handleAddToList = () => {
    if (!selectedList) return
    startTransition(async () => {
      try {
        await addMovieToList(parseInt(selectedList), movie.id)
        setAddToListDialogOpen(false)
        setSelectedList('')
      } catch {
        alert('Listeye ekleme başarısız')
      }
    })
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40',
        isPending && 'opacity-60',
      )}
    >
      <Link href={`/movies/${movie.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-secondary block">
        {watchStatus !== 'watched' && (
          <div className="absolute top-2 left-2 z-10 bg-yellow-500/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-yellow-950 uppercase tracking-wide border border-yellow-400 shadow-sm">
            İzlenmedi
          </div>
        )}
        {movie.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.poster_url || '/placeholder.svg'}
            alt={`${movie.title} afişi`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/50 hover:bg-secondary/80 transition-colors">
            <Clapperboard className="h-12 w-12" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/movies/${movie.id}`} className="hover:underline">
              <h3 className="truncate font-medium leading-tight text-foreground">
                {movie.title}
              </h3>
            </Link>
            <p className="truncate text-xs text-muted-foreground mt-1">
              {[movie.year, movie.director].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menü</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setWatcherDialogOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Puanla
              </DropdownMenuItem>
              {!hasCommented && (
                <DropdownMenuItem onClick={handleCommentClick}>
                  <Star className="mr-2 h-4 w-4" />
                  Yorum yap
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setCommentsDialogOpen(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Yorumları gör
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRecommendClick}>
                <Share2 className="mr-2 h-4 w-4" />
                Öner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddToListDialogOpen(true)}>
                <ListPlus className="mr-2 h-4 w-4" />
                Listeye Ekle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(movie)}>
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setConfirmOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {movie.genre && (
          <Badge variant="secondary" className="w-fit text-xs font-normal">
            {movie.genre}
          </Badge>
        )}

        <div className="mt-auto pt-2 pb-1">
          {averageRating || imdbRating ? (
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-1.5 px-1 text-xs text-muted-foreground border-t pt-2 border-border/50">
              <span className="flex items-center gap-2">
                {imdbRating && (
                  <span className="flex items-center gap-1 font-medium" title="IMDb Puanı">
                    <span className="font-bold text-yellow-400 bg-black/80 px-1 py-0.5 rounded text-[10px]">IMDb</span>
                    <span className="text-foreground font-bold">{imdbRating}</span>
                  </span>
                )}
                {averageRating && (
                  <span className="flex items-center gap-1 font-medium" title="Film Meclisi Puanı">
                    <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
                    <span className="text-foreground font-bold text-yellow-500">{averageRating}</span> 
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1" title="Toplam Yorum">
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{totalComments} <span className="hidden sm:inline">Yorum</span></span>
              </span>
            </div>
          ) : (
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-1.5 px-1 text-[10px] text-muted-foreground/70 uppercase tracking-wide font-medium border-t pt-2 border-border/50">
              <span className="truncate">Henüz Puanlanmadı</span>
              {totalComments > 0 && (
                <span className="flex items-center gap-1 normal-case tracking-normal text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3 shrink-0" />
                  {totalComments}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto">
          {initialRating > 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCommentsDialogOpen(true)}
              className="w-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
            >
              <MessageSquare className="h-3 w-3 mr-1.5 shrink-0" />
              <span className="truncate">Yorumları Gör</span>
            </Button>
          ) : (
            <div className={`grid gap-2 ${!hasCommented && watchStatus === 'watched' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setWatcherDialogOpen(true)}
                className="px-1 sm:px-3"
              >
                <Eye className="h-3 w-3 sm:mr-1 shrink-0" />
                <span className="truncate text-[10px] sm:text-xs">Puanla</span>
              </Button>
              
              {!hasCommented && watchStatus === 'watched' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCommentClick}
                  className="px-1 sm:px-3"
                >
                  <Star className="h-3 w-3 sm:mr-1 shrink-0" />
                  <span className="truncate text-[10px] sm:text-xs">Yorum</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Film silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{movie.title}&quot; kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={watcherDialogOpen} onOpenChange={setWatcherDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filmi Puanla</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {initialRating > 0 ? (
              <div className="p-4 bg-secondary/50 rounded-lg text-center border border-border">
                <p className="text-sm font-medium">Bu filme zaten <strong>{initialRating}</strong> puan verdiniz.</p>
                <p className="text-xs text-muted-foreground mt-1">Puanlar sonradan değiştirilemez.</p>
              </div>
            ) : watchStatus !== 'watched' ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <p className="text-lg">Bu <strong>{movie.title}</strong> filmini izledin mi?</p>
                <div className="flex gap-4 w-full justify-center mt-2">
                  <Button 
                    onClick={() => {
                      setWatchStatus('watched')
                    }} 
                    className="flex-1"
                  >
                    Evet, İzledim
                  </Button>
                  <Button 
                    onClick={() => {
                      handleMarkAsWantToWatch()
                    }} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Hayır, İzleyeceğim
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <Label className="text-center mb-2">Bu filme kaç puan verirsin? (1-10)</Label>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg text-sm font-bold transition-all border ${
                          rating === num
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-110'
                            : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  
                  {!hasCommented && (
                    <div className="mt-4 flex flex-col gap-2 text-left">
                      <Label className="text-sm">Yorumunuz (isteğe bağlı)</Label>
                      <Textarea
                        placeholder="Film hakkında ne düşünüyorsunuz?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="resize-none text-sm"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWatcherDialogOpen(false)}>
              Kapat
            </Button>
            {initialRating === 0 && watchStatus === 'watched' && (
              <Button onClick={handleMarkAsWatched} disabled={!rating}>
                Puanı Kaydet
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yorum yap</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="comment">Yorumun</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bu film hakkında ne düşünüyorsun?"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddComment}>Yayınla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yorumlar</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Henüz yorum yok.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{comment.anonymous_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                ))}
              </div>
            )}
            
            {!hasCommented && watchStatus === 'watched' && (
              <div className="mt-4 flex flex-col gap-3 p-4 bg-secondary/30 rounded-xl border border-border">
                <Label htmlFor="inline-comment" className="text-sm font-semibold">Senin Yorumun</Label>
                <Textarea
                  id="inline-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Bu film hakkında ne düşünüyorsun?"
                  rows={2}
                  className="bg-background"
                />
                <Button 
                  onClick={handleAddComment} 
                  disabled={isPending || !comment.trim()} 
                  className="self-end"
                >
                  {isPending ? 'Gönderiliyor...' : 'Yayınla'}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setCommentsDialogOpen(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={recommendDialogOpen} onOpenChange={setRecommendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Film öner</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="recommendUser">Kullanıcı seç</Label>
              <select
                id="recommendUser"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Kullanıcı seç...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Bu filmi önermek istediğin kullanıcıyı seç.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecommendDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleRecommend}>Öner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addToListDialogOpen} onOpenChange={setAddToListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Listeye Ekle</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {movieLists.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Henüz listeniz yok. Önce bir liste oluşturun.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="listSelect">Liste seç</Label>
                <select
                  id="listSelect"
                  value={selectedList}
                  onChange={(e) => setSelectedList(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">Liste seç...</option>
                  {movieLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddToListDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddToList} disabled={!selectedList || movieLists.length === 0}>
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
