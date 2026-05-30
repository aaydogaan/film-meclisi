import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 relative overflow-hidden">
      {/* Decorative background glow matching the premium design */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">
          Sayfa yükleniyor...
        </p>
      </div>
    </div>
  )
}
