import { NextResponse } from 'next/server'
import { verifyToken, supabaseAdmin } from '@/lib/auth'
import { FacebookAPI } from '@/lib/facebook'

export async function GET(request, { params }) {
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

    const conversationId = params.id

    // Fetch messages from database
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    if (msgError) throw msgError
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
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

    const { message } = await request.json()
    const conversationId = params.id

    // Save the message in DB
    const { data: msgInsert, error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: decoded.userId,
        sender_name: 'Agent',
        body: message
      })
      .select()
      .single()
    if (insertError) throw insertError

    // Get conversation and page token
    const { data: conv, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('page_id, customer_id')
      .eq('id', conversationId)
      .single()
    if (convError) throw convError

    const { data: pageRow, error: pageError } = await supabaseAdmin
      .from('facebook_pages')
      .select('access_token')
      .eq('user_id', decoded.userId)
      .eq('page_id', conv.page_id)
      .single()
    if (pageError) throw pageError

    // Send via FB
    try {
      const fb = new FacebookAPI(pageRow.access_token)
      await fb.sendMessage(conv.customer_id, message)
    } catch (fbErr) {
      console.error('FB send error', fbErr)
    }

    console.log(`Sending message "${message}" to conversation ${conversationId}`)

    return NextResponse.json({ message: 'Message sent successfully', id: msgInsert.id })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}