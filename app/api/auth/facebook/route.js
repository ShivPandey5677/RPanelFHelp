import { NextResponse } from 'next/server'
import { generateFacebookLoginURL } from '@/lib/facebook'

export async function GET() {
  try {
    const loginURL = generateFacebookLoginURL()
    return NextResponse.redirect(loginURL)
  } catch (error) {
    console.error('Facebook auth error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Facebook login URL' },
      { status: 500 }
    )
  }
}