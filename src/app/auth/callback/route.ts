import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(new URL('/signin?error=no_code', requestUrl.origin))
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(new URL('/signin?error=auth_error', requestUrl.origin))
    }

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return NextResponse.redirect(new URL('/signin?error=user_error', requestUrl.origin))
    }

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileError)
      return NextResponse.redirect(new URL('/signin?error=profile_error', requestUrl.origin))
    }

    // Redirect based on profile status
    if (!profile || !profile.full_name) {
      console.log('Redirecting to onboarding - No profile found')
      return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
    }

    console.log('Redirecting to dashboard - Profile exists')
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(new URL('/signin?error=unknown', request.url))
  }
} 