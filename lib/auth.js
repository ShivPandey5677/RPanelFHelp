import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

// Create a separate admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Make sure this is set in your environment
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Regular client for client-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
)

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function getUser(email) {
  // First try to get the user from Supabase Auth
  const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserByEmail(email)
  
  if (authError || !user) return null
  
  // Then get the user from the public.users table
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) return null
  return data
}

export async function createUser(name, email, password) {
  // First, sign up the user with Supabase Auth
  const { data: authData, error: signUpError } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  })
  
  if (signUpError) throw new Error(signUpError.message)
  
  // Then create a corresponding user in the public.users table
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .insert([
      { 
        id: authData.user.id,
        name,
        email,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()
  
  if (userError) {
    // If user creation fails, delete the auth user to keep things clean
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    throw new Error(userError.message)
  }
  
  return userData
}