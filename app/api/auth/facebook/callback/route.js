import { NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/facebook'

// Opt out of static generation
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = 'force-dynamic'

export const runtime = 'nodejs' // Ensure this runs on Node.js runtime

export const fetchCache = 'force-no-store' // Prevent caching of this route

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url, `http://${request.headers.get('host')}`)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect('/integration?error=no_code')
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code)
    
    // Here you would typically store the Facebook access token
    // and associate it with the user's account
    
    // Use absolute URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/integration?success=true`)
  } catch (error) {
    console.error('Facebook callback error:', error)
    // Use absolute URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/integration?error=callback_failed`)
  }
}