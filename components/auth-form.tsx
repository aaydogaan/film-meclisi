'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Search, Star, List, Users, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AvatarOption = { style: string; seed: string }
const AVATAR_OPTIONS: AvatarOption[] = [
  { style: 'big-ears', seed: 'Felix' },
  { style: 'big-ears', seed: 'Jack' },
  { style: 'big-ears', seed: 'Aneka' },
  { style: 'big-ears', seed: 'Zoe' },
  { style: 'big-ears', seed: 'Sam' },
  { style: 'big-ears', seed: 'Mia' },
  
  { style: 'adventurer', seed: 'Jude' },
  { style: 'adventurer', seed: 'Oreo' },
  { style: 'adventurer', seed: 'Leo' },
  { style: 'adventurer', seed: 'Cleo' },
  { style: 'adventurer', seed: 'Finn' },
  { style: 'adventurer', seed: 'Rex' },
  
  { style: 'croodles-neutral', seed: 'Charlie' },
  { style: 'croodles-neutral', seed: 'Molly' },
  { style: 'croodles-neutral', seed: 'Buddy' },
  { style: 'croodles-neutral', seed: 'Lola' },
  { style: 'croodles-neutral', seed: 'Toby' },
  { style: 'croodles-neutral', seed: 'Ruby' },
  
  { style: 'dylan', seed: 'Bella' },
  { style: 'dylan', seed: 'Luna' },
  { style: 'dylan', seed: 'Max' },
  { style: 'dylan', seed: 'Oliver' },
  { style: 'dylan', seed: 'Milo' },
  { style: 'dylan', seed: 'Chloe' },
  
  { style: 'lorelei-neutral', seed: 'Lucy' },
  { style: 'lorelei-neutral', seed: 'Daisy' },
  { style: 'lorelei-neutral', seed: 'Milo2' },
  { style: 'lorelei-neutral', seed: 'Lily' },
  { style: 'lorelei-neutral', seed: 'Coco' },
  { style: 'lorelei-neutral', seed: 'Rocky' }
]

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFakeLoader, setShowFakeLoader] = useState(false)
  const [fakeLoaderText, setFakeLoaderText] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption>(AVATAR_OPTIONS[0])
  const carouselRef = useRef<HTMLDivElement>(null)

  const isSignUp = mode === 'sign-up'

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    if (isSignUp) {
      const FUNNY_MESSAGES = [
        "Sunuculara fısıldanıyor...",
        "Sizin için en iyi koltuk ayrılıyor...",
        "Kablolar birbirine bağlanıyor...",
        "Kodlar derleniyor, az kaldı...",
        "Kayıt olmanız aslında bu kadar uzun sürmüyor ama Recep böyle istedi :)"
      ]
      
      setShowFakeLoader(true)
      setFakeLoaderText(FUNNY_MESSAGES[0])
      
      let messageIndex = 0
      const messageInterval = setInterval(() => {
        if (messageIndex < FUNNY_MESSAGES.length - 1) {
          messageIndex++
          setFakeLoaderText(FUNNY_MESSAGES[messageIndex])
        }
      }, 1500)

      // Minimum 9.5 saniye bekleme süresi (son mesajı rahat okuması için)
      const delayPromise = new Promise(resolve => setTimeout(resolve, 9500))

      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name,
            avatar_url: `https://api.dicebear.com/9.x/${selectedAvatar.style}/svg?seed=${selectedAvatar.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`
          },
          emailRedirectTo: `${window.location.origin}/sign-in`,
        },
      })

      const [, response] = await Promise.all([delayPromise, signUpPromise])
      
      clearInterval(messageInterval)
      setShowFakeLoader(false)

      const { error } = response
      if (error) {
        setError(
          error.message === 'User already registered'
            ? 'Bu e-posta adresi zaten kayıtlı.'
            : error.message ?? 'Bir şeyler ters gitti'
        )
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(
          error.message === 'Invalid login credentials'
            ? 'E-posta veya şifre hatalı'
            : error.message ?? 'Bir şeyler ters gitti'
        )
        setLoading(false)
        return
      }
    }

    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-svh bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {showFakeLoader && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8" />
          <p className="text-xl md:text-2xl font-medium text-center animate-pulse px-4 max-w-md text-foreground">
            {fakeLoaderText}
          </p>
        </div>
      )}

      {/* Developer Info */}
      <div className="absolute bottom-4 text-sm font-medium text-muted-foreground/60 tracking-wide text-center w-full pointer-events-none">
        Geliştirici <span className="text-foreground/70">Recep Aydoğan</span>
      </div>

      {/* Decorative background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <img 
            src="/images/film-meclisi-logo.png" 
            alt="Film Meclisi Logo" 
            className="h-16 sm:h-24 w-auto object-contain mb-6 drop-shadow-2xl"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            {isSignUp ? "Film Meclisi'ne katıl" : 'Tekrar hoş geldin'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 text-pretty">
            {isSignUp
              ? 'Film günlüğünü oluşturmak için kaydol'
              : 'Film günlüğüne devam etmek için giriş yap'}
          </p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-card/40 backdrop-blur-2xl p-8 shadow-2xl shadow-black/40 ring-1 ring-white/10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {isSignUp && (
              <>
                <div className="flex flex-col gap-3">
                  <Label className="text-muted-foreground ml-1">Profil Fotoğrafı Seç</Label>
                  <div className="relative group">
                    <button 
                      type="button" 
                      onClick={scrollLeft}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-background/90 hover:bg-background hover:scale-110 border border-border rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    >
                      <ChevronLeft className="w-4 h-4 text-foreground" />
                    </button>
                    
                    <div 
                      ref={carouselRef}
                      className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 snap-x hide-scrollbar scroll-smooth" 
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {AVATAR_OPTIONS.map((avatar) => {
                        const isSelected = selectedAvatar.style === avatar.style && selectedAvatar.seed === avatar.seed
                        const url = `https://api.dicebear.com/9.x/${avatar.style}/svg?seed=${avatar.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`
                        return (
                          <button
                            key={`${avatar.style}-${avatar.seed}`}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`relative shrink-0 snap-center rounded-full overflow-hidden transition-all duration-300 w-16 h-16 ${
                              isSelected ? 'ring-4 ring-primary ring-offset-2 ring-offset-background scale-110 z-10 shadow-lg shadow-primary/30' : 'opacity-60 hover:opacity-100 hover:scale-105 border border-white/10 grayscale-[30%] hover:grayscale-0'
                            }`}
                          >
                            <img src={url} alt={avatar.seed} className="w-full h-full object-cover" />
                          </button>
                        )
                      })}
                    </div>

                    <button 
                      type="button" 
                      onClick={scrollRight}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-background/90 hover:bg-background hover:scale-110 border border-border rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    >
                      <ChevronRight className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-muted-foreground ml-1">İsim</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Adınız"
                    className="h-12 rounded-xl bg-background/50 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
              </>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-muted-foreground ml-1">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="ornek@eposta.com"
                className="h-12 rounded-xl bg-background/50 border-white/10 focus-visible:ring-primary/50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-muted-foreground ml-1">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="En az 6 karakter"
                className="h-12 rounded-xl bg-background/50 border-white/10 focus-visible:ring-primary/50"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-2 h-12 rounded-xl font-semibold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98]">
              {loading
                ? 'Lütfen bekleyin...'
                : isSignUp
                  ? 'Hesap oluştur'
                  : 'Giriş yap'}
            </Button>
          </form>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {isSignUp ? 'Zaten hesabın var mı? ' : 'Hesabın yok mu? '}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            {isSignUp ? 'Giriş yap' : 'Kaydol'}
          </Link>
        </p>

        {isSignUp && (
          <div className="flex justify-center mt-4 pb-8 animate-in fade-in duration-1000">
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <span className="p-1.5 rounded-full bg-secondary/50 group-hover:bg-secondary transition-colors">
                    <Info className="w-4 h-4" />
                  </span>
                  <span>Film Meclisi nedir, nasıl kullanılır?</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-border bg-background shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-semibold mb-2">Neler Yapabilirsiniz?</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-3 pb-2">
                  <div className="bg-secondary/50 p-3.5 rounded-2xl border border-border flex items-center gap-4 hover:bg-secondary transition-colors">
                    <div className="p-2.5 bg-primary/20 text-primary rounded-xl shrink-0">
                      <Search className="w-5 h-5"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Keşfet & Ekle</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">İstediğiniz filmi anında Türkçe arayın ve günlüğünüze ekleyin.</p>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 p-3.5 rounded-2xl border border-border flex items-center gap-4 hover:bg-secondary transition-colors">
                    <div className="p-2.5 bg-yellow-500/20 text-yellow-500 rounded-xl shrink-0">
                      <Star className="w-5 h-5"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Puanla & Yorumla</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">İzlediğiniz filmlere 1-10 arası puan verin ve yorum yapın.</p>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 p-3.5 rounded-2xl border border-border flex items-center gap-4 hover:bg-secondary transition-colors">
                    <div className="p-2.5 bg-blue-500/20 text-blue-500 rounded-xl shrink-0">
                      <List className="w-5 h-5"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Özel Listeler</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Favori filmlerinizden oluşan kendinize has koleksiyonlar hazırlayın.</p>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 p-3.5 rounded-2xl border border-border flex items-center gap-4 hover:bg-secondary transition-colors">
                    <div className="p-2.5 bg-pink-500/20 text-pink-500 rounded-xl shrink-0">
                      <Users className="w-5 h-5"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Arkadaşına Öner</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Beğendiğiniz filmleri diğer kullanıcılara doğrudan tavsiye edin.</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </main>
  )
}
