import { createClient } from '@/lib/supabase/server'

export type Badge = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  is_earned?: boolean
}

export const ALL_BADGES: Badge[] = [
  { id: 'first_step', name: 'İlk Adım', description: 'Sisteme ilk filmini ekledin/izledin.', icon: '🎬', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'cinephile', name: 'Sinefil', description: 'Toplamda 50 film izledin.', icon: '🍿', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'legend', name: 'Efsanevi İzleyici', description: 'Toplamda 100 film izledin.', icon: '👑', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { id: 'critic', name: 'Eleştirmen', description: 'Filmlere en az 10 detaylı yorum yaptın.', icon: '✍️', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'rater', name: 'Puan Uzmanı', description: 'En az 20 farklı filme puan verdin.', icon: '⭐', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'perfectionist', name: 'Mükemmeliyetçi', description: 'En az 5 filme 10/10 tam puan verdin.', icon: '💯', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  { id: 'scifi_fan', name: 'Bilim Kurgu Kurdu', description: 'Bilim kurgu türünde en az 5 film izledin.', icon: '👽', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { id: 'action_fan', name: 'Aksiyon Sever', description: 'Aksiyon türünde en az 5 film izledin.', icon: '💥', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { id: 'list_maker', name: 'Listeci', description: 'Kendine ait en az 3 adet "Özel Liste" oluşturdun.', icon: '📋', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { id: 'social', name: 'Sosyal Kelebek', description: 'Arkadaşlarına en az 5 farklı film önerdin.', icon: '🦋', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' }
]

export async function getUserBadges(userId: string): Promise<Badge[]> {
  const supabase = await createClient()
  const earnedIds = new Set<string>()

  // Get watches with movie info
  const { data: watches } = await supabase
    .from('movie_watchers')
    .select('rating, movies(genre)')
    .eq('user_id', userId)
    .eq('status', 'watched')

  const watchedCount = watches?.length || 0
  const ratedCount = watches?.filter(w => w.rating && w.rating > 0).length || 0
  const perfectScoreCount = watches?.filter(w => w.rating === 10).length || 0
  
  const scifiCount = watches?.filter(w => {
    const genre = (w.movies as any)?.genre?.toLowerCase() || ''
    return genre.includes('sci-fi') || genre.includes('bilim kurgu')
  }).length || 0

  const actionCount = watches?.filter(w => {
    const genre = (w.movies as any)?.genre?.toLowerCase() || ''
    return genre.includes('action') || genre.includes('aksiyon')
  }).length || 0

  // Get comments
  const { count: commentCount } = await supabase
    .from('movie_comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get lists
  const { count: listCount } = await supabase
    .from('movie_lists')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get recommendations
  const { count: recCount } = await supabase
    .from('movie_recommendations')
    .select('*', { count: 'exact', head: true })
    .eq('recommended_by', userId)

  // Determine earned badges
  if (watchedCount >= 1) earnedIds.add('first_step')
  if (watchedCount >= 50) earnedIds.add('cinephile')
  if (watchedCount >= 100) earnedIds.add('legend')
  if ((commentCount || 0) >= 10) earnedIds.add('critic')
  if (ratedCount >= 20) earnedIds.add('rater')
  if (perfectScoreCount >= 5) earnedIds.add('perfectionist')
  if (scifiCount >= 5) earnedIds.add('scifi_fan')
  if (actionCount >= 5) earnedIds.add('action_fan')
  if ((listCount || 0) >= 3) earnedIds.add('list_maker')
  if ((recCount || 0) >= 5) earnedIds.add('social')

  return ALL_BADGES.map(badge => ({
    ...badge,
    is_earned: earnedIds.has(badge.id)
  }))
}
