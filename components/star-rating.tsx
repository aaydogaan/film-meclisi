'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type StarRatingProps = {
  value: number
  onChange?: (value: number) => void
  size?: number
  readOnly?: boolean
  className?: string
}

export function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
  className,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value

  return (
    <div className={cn('flex items-center gap-0.5', className)} role={readOnly ? undefined : 'radiogroup'}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= display
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            aria-label={`${star} yıldız`}
            onClick={() => onChange?.(star === value ? 0 : star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(null)}
            className={cn(
              'transition-transform',
              !readOnly && 'cursor-pointer hover:scale-110',
              readOnly && 'cursor-default',
            )}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(
                'transition-colors',
                active
                  ? 'fill-primary text-primary'
                  : 'fill-transparent text-muted-foreground/40',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
