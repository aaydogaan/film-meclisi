'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Film, LogOut, Users, Share2, Home, List, BarChart3, Menu, Clock, Trophy, Star, Bookmark, User, MessageSquare, Eye, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getRecentActivities } from '@/app/actions/movies'

export function AppHeader({ name, email, avatarUrl }: { name: string; email: string; avatarUrl?: string }) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activitiesOpen, setActivitiesOpen] = useState(false)
  const [activities, setActivities] = useState<any[]>([])

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const loadActivities = async () => {
    const data = await getRecentActivities(10)
    setActivities(data)
  }

  useEffect(() => {
    if (activitiesOpen) {
      loadActivities()
    }
  }, [activitiesOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Link href="/">
            <img
              src="/images/film-meclisi-logo.png"
              alt="Film Meclisi Logo"
              className="h-14 sm:h-16 w-auto object-contain cursor-pointer"
            />
          </Link>
          <Dialog open={activitiesOpen} onOpenChange={setActivitiesOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="default" title="FM'de neler oluyor" className="gap-2 bg-yellow-100/50 hover:bg-yellow-200/50 text-yellow-900">
                <Zap className="h-5 w-5" />
                <span>FM'de neler oluyor</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  FM'de neler oluyor?
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {activities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Henüz aktivite yok</p>
                ) : (
                  activities.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                      {activity.type === 'comment' && <MessageSquare className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />}
                      {activity.type === 'recommendation' && <Share2 className="h-4 w-4 shrink-0 text-pink-500 mt-0.5" />}
                      {activity.type === 'watch' && (
                        activity.rating ? <Star className="h-4 w-4 shrink-0 text-yellow-500 mt-0.5" /> : <Eye className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                      )}
                      <p className="text-sm leading-snug">
                        <span className="font-medium text-foreground">{activity.user}</span>{' '}
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
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild title="Ana Sayfa">
            <Link href="/">
              <Home className="h-5 w-5" />
              <span className="sr-only">Ana Sayfa</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="Liderlik Tablosu">
            <Link href="/leaderboard">
              <Trophy className="h-5 w-5" />
              <span className="sr-only">Liderlik Tablosu</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="Listeler">
            <Link href="/lists">
              <List className="h-5 w-5" />
              <span className="sr-only">Listeler</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="İstatistikler">
            <Link href="/statistics">
              <BarChart3 className="h-5 w-5" />
              <span className="sr-only">İstatistikler</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="Öneriler">
            <Link href="/recommendations">
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Öneriler</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="Kullanıcılar">
            <Link href="/users">
              <Users className="h-5 w-5" />
              <span className="sr-only">Kullanıcılar</span>
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-2">
                <Avatar className="h-7 w-7">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                  <AvatarFallback className="bg-secondary text-xs text-foreground">
                    {initials || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-32 truncate text-sm sm:inline">
                  {name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="truncate">{name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-background">
          <div className="flex flex-col p-4 space-y-2">
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                router.push('/')
                setMobileMenuOpen(false)
              }}
            >
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfa
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                router.push('/watchlist')
                setMobileMenuOpen(false)
              }}
            >
              <Clock className="mr-2 h-4 w-4" />
              İlk İzlenecekler
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                router.push('/rankings')
                setMobileMenuOpen(false)
              }}
            >
              <Star className="mr-2 h-4 w-4" />
              Film Sıralaması
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                router.push('/leaderboard')
                setMobileMenuOpen(false)
              }}
            >
              <Trophy className="mr-2 h-4 w-4" />
              Liderlik Tablosu
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                router.push('/lists')
                setMobileMenuOpen(false)
              }}
            >
              <List className="mr-2 h-4 w-4" />
              Listeler
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                router.push('/statistics')
                setMobileMenuOpen(false)
              }}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              İstatistikler
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                router.push('/recommendations')
                setMobileMenuOpen(false)
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Öneriler
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                router.push('/users')
                setMobileMenuOpen(false)
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Kullanıcılar
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
