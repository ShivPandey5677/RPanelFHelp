import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    console.log('Facebook webhook verified')
    return new NextResponse(challenge)
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    if (body.object === 'page') {
      body.entry.forEach((entry) => {
        const webhookEvent = entry.messaging[0]
        console.log('Received webhook event:', webhookEvent)
        
        // Here you would process the incoming message
        // and save it to your database
        
        if (webhookEvent.message) {
          // Process incoming message
          console.log('Incoming message:', webhookEvent.message.text)
          
          // You would typically:
          // 1. Find or create a conversation
          // 2. Save the message to the database
          // 3. Notify connected agents
        }
      })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}