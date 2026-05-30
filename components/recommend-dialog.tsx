'use client'

import { useState } from 'react'
import { addRecommendation } from '@/app/actions/movies'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function RecommendDialog({ 
  movieId, 
  movieTitle, 
  users,
  hasWatched
}: { 
  movieId: number
  movieTitle: string
  users: any[] 
  hasWatched: boolean
}) {
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleRecommend = async () => {
    if (!selectedUser) return
    
    setLoading(true)
    try {
      await addRecommendation(movieId, selectedUser)
      setOpen(false)
      toast({
        title: 'Film Önerildi',
        description: `${movieTitle} başarıyla önerildi.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: err.message || 'Öneri gönderilemedi.',
      })
    } finally {
      setLoading(false)
      setSelectedUser('')
    }
  }

  if (!hasWatched) {
    return (
      <Button 
        variant="secondary" 
        size="lg" 
        className="font-semibold bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
        onClick={() => toast({
          variant: 'destructive',
          title: 'İşlem Engellendi',
          description: 'İzlemediğin filmi nasıl önereceksin?'
        })}
      >
        <Send className="mr-2 h-5 w-5" />
        Arkadaşına Öner
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="lg" className="font-semibold bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md">
          <Send className="mr-2 h-5 w-5" />
          Arkadaşına Öner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Film Öner</DialogTitle>
          <DialogDescription>
            <strong>{movieTitle}</strong> filmini kime önermek istersiniz?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Kullanıcı seçin..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleRecommend} disabled={!selectedUser || loading} className="w-full">
            {loading ? 'Gönderiliyor...' : 'Öneriyi Gönder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
