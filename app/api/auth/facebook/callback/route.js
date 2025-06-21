import { NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/facebook'
import { verifyToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect('/integration?error=no_code')
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code)
    
    // Here you would typically store the Facebook access token
    // and associate it with the user's account
    
    return NextResponse.redirect('/integration?success=true')
  } catch (error) {
    console.error('Facebook callback error:', error)
    return NextResponse.redirect('/integration?error=callback_failed')
  }
}