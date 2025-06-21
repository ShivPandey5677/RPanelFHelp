import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

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

    // Mock messages data
    const messages = conversationId === '1' ? [
      {
        id: '1',
        conversation_id: '1',
        sender_id: 'amit_rg',
        sender_name: 'Amit RG',
        content: 'Is it in stock right now?',
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        conversation_id: '1',
        sender_id: 'agent',
        sender_name: 'Richard Panel',
        content: "We've 3 left in stock!",
        created_at: new Date(Date.now() - 1 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        conversation_id: '1',
        sender_id: 'agent',
        sender_name: 'Richard Panel',
        content: 'If you order before 8PM we can ship it today.',
        created_at: new Date().toISOString()
      }
    ] : [
      {
        id: '4',
        conversation_id: '2',
        sender_id: 'hiten_saxena',
        sender_name: 'Hiten Saxena',
        content: 'Hi do you have any T-Shirt available in stock right now?',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      }
    ]

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

    // Here you would typically:
    // 1. Save the message to the database
    // 2. Send the message via Facebook Messenger API
    
    console.log(`Sending message "${message}" to conversation ${conversationId}`)

    return NextResponse.json({ 
      message: 'Message sent successfully',
      id: Date.now().toString()
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}