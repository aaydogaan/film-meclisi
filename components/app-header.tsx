'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Film, LogOut, Users, Share2, Home, List, BarChart3, Menu, Clock, Trophy, Star, Bookmark, User } from 'lucide-react'
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
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function AppHeader({ name, email, avatarUrl }: { name: string; email: string; avatarUrl?: string }) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <img 
            src="/images/film-meclisi-logo.png" 
            alt="Film Meclisi Logo" 
            className="h-14 sm:h-16 w-auto object-contain"
          />
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
