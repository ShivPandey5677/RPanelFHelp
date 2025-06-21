import { NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { supabase } from '@/lib/auth'

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create the user using our auth function
    const user = await createUser(name, email, password)
    
    // Sign in the user to get a session
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Auto login after registration failed:', error)
      // Still return success since the user was created, just not logged in
      return NextResponse.json({
        message: 'User created successfully. Please log in.',
        user: { id: user.id, name: user.name, email: user.email }
      })
    }

    // Get the session
    const { data: { session } } = await supabase.auth.getSession()

    return NextResponse.json({
      message: 'Registration and login successful',
      token: session.access_token,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}