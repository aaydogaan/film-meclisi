import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    const supabase = await createClient()
    const { data: { users } } = await supabase.auth.admin.listUsers()
    
    const user = users?.find(u => u.email === email)
    
    if (user) {
      return NextResponse.json({ userId: user.id })
    } else {
      return NextResponse.json({ userId: null }, { status: 404 })
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
