'use client'

import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { MessageSquare, Share2, Eye, Star, Clapperboard } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type TimelineActivity = {
  id: string
  type: 'watch' | 'comment' | 'recommendation'
  user_id: string
  user_name: string
  movie_id: number
  movie_title: string
  movie_poster?: string
  action: string
  target?: string
  rating?: number
  created_at: string
}

export function SocialTimeline({ activities }: { activities: any[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed rounded-2xl bg-card/30">
        <p className="text-muted-foreground">Henüz sosyal bir hareketlilik yok.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {activities.map((activity, index) => {
        let Icon = Eye
        let iconColor = 'text-blue-500'
        let iconBg = 'bg-blue-500/10'
        let actionHtml = ''

        if (activity.type === 'comment') {
          Icon = MessageSquare
          iconColor = 'text-emerald-500'
          iconBg = 'bg-emerald-500/10'
          actionHtml = `<strong>${activity.movie_title}</strong> filmine yorum yaptı.`
        } else if (activity.type === 'recommendation') {
          Icon = Share2
          iconColor = 'text-pink-500'
          iconBg = 'bg-pink-500/10'
          actionHtml = `<strong>${activity.movie_title}</strong> filmini <strong>${activity.to}</strong> kullanıcısına önerdi.`
        } else if (activity.type === 'watch') {
          if (activity.rating) {
            Icon = Star
            iconColor = 'text-yellow-500'
            iconBg = 'bg-yellow-500/10'
            actionHtml = `<strong>${activity.movie_title}</strong> filmini izledi ve <strong>${activity.rating}/10</strong> puan verdi.`
          } else {
            Icon = Eye
            iconColor = 'text-blue-500'
            iconBg = 'bg-blue-500/10'
            actionHtml = `<strong>${activity.movie_title}</strong> filmini izledi.`
          }
        }

        return (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background ${iconBg} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="flex gap-4">
                {/* Movie Poster (Optional) */}
                {activity.movie_poster ? (
                  <Link href={`/movies/${activity.movie_id}`} className="shrink-0">
                    <img src={activity.movie_poster} alt="poster" className="w-12 h-16 object-cover rounded-lg shadow-sm border border-border/50 hover:scale-105 transition-transform" />
                  </Link>
                ) : (
                  <Link href={`/movies/${activity.movie_id}`} className="shrink-0">
                    <div className="w-12 h-16 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground/50 border border-border/50">
                      <Clapperboard className="h-4 w-4" />
                    </div>
                  </Link>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Link href={`/users/${activity.user_id}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate">
                      {activity.user}
                    </Link>
                    <time className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 font-medium bg-secondary/50 px-2 py-0.5 rounded-full">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: tr })}
                    </time>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-snug" dangerouslySetInnerHTML={{ __html: actionHtml }} />
                  
                  {activity.type === 'comment' && activity.target && (
                    <div className="mt-2 text-sm italic text-foreground/80 bg-background/50 p-2.5 rounded-xl border border-border/50 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-primary/20 before:rounded-r">
                      "{activity.target}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
