import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Mock conversations data for now
    const conversations = [
      {
        id: '1',
        customer_id: 'amit_rg',
        customer_name: 'Amit RG',
        customer_avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
        last_message: 'Is it in stock right now?',
        last_message_time: new Date().toISOString(),
        unread_count: 1
      },
      {
        id: '2',
        customer_id: 'hiten_saxena',
        customer_name: 'Hiten Saxena',
        customer_avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100&h=100&fit=crop&crop=face',
        last_message: 'Hi do you have any T-Shirt available in stock right now?',
        last_message_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        unread_count: 0
      }
    ]

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Failed to get conversations' },
      { status: 500 }
    )
  }
}