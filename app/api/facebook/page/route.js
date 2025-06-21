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

    const { data: page, error } = await supabase
      .from('facebook_pages')
      .select('*')
      .eq('user_id', decoded.userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Get Facebook page error:', error)
    return NextResponse.json(
      { error: 'Failed to get Facebook page' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
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

    const { error } = await supabase
      .from('facebook_pages')
      .delete()
      .eq('user_id', decoded.userId)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Page integration deleted successfully' })
  } catch (error) {
    console.error('Delete Facebook page error:', error)
    return NextResponse.json(
      { error: 'Failed to delete Facebook page integration' },
      { status: 500 }
    )
  }
}