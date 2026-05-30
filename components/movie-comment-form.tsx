'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { addMovieComment } from '@/app/actions/movies'
import { useToast } from '@/components/ui/use-toast'

export function MovieCommentForm({ 
  movieId, 
  movieTitle,
  defaultName 
}: { 
  movieId: number
  movieTitle: string
  defaultName: string 
}) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const comment = formData.get('comment') as string
    const name = formData.get('anonymous_name') as string || defaultName

    try {
      if (comment?.trim()) {
        await addMovieComment(movieId, comment, name)
        // Reset form
        const form = document.getElementById('comment-form') as HTMLFormElement
        if (form) form.reset()
        toast({ title: 'Başarılı', description: 'Yorumunuz eklendi.' })
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Hata', description: err.message || 'Yorum eklenemedi.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form id="comment-form" action={handleSubmit} className="mb-8 p-5 bg-card border border-border rounded-xl shadow-sm">
      <h3 className="font-semibold mb-3">Yorum Yap</h3>
      <div className="space-y-3">
        <Input 
          name="anonymous_name" 
          placeholder="Görünecek Ad (İsteğe bağlı)" 
          defaultValue={defaultName}
          className="max-w-xs"
        />
        <Textarea 
          name="comment" 
          placeholder={`${movieTitle} hakkında ne düşünüyorsun?`} 
          required 
          className="min-h-[100px] resize-y"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Yorumu Gönder'}
          </Button>
        </div>
      </div>
    </form>
  )
}
