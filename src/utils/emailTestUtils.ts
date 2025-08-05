import { supabase } from '../lib/supabase'

export const testEmailDelivery = async (email: string) => {
  try {
    console.log('Testing email delivery to:', email)
    
    // Try to sign up a user to trigger email
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'TempPassword123!',
      options: {
        emailRedirectTo: window.location.origin
      }
    })

    if (error) {
      console.error('Signup error:', error)
      return {
        success: false,
        error: error.message,
        suggestion: getErrorSuggestion(error.message)
      }
    }

    console.log('Signup successful:', data)
    return {
      success: true,
      message: 'Signup successful - check email for confirmation',
      data: data
    }

  } catch (err) {
    console.error('Test failed:', err)
    return {
      success: false,
      error: 'Test failed',
      suggestion: 'Check console for details'
    }
  }
}

const getErrorSuggestion = (errorMessage: string) => {
  if (errorMessage.includes('email')) {
    return 'Check SMTP configuration in Supabase dashboard'
  }
  if (errorMessage.includes('rate')) {
    return 'Rate limit hit - wait a few minutes and try again'
  }
  if (errorMessage.includes('confirm')) {
    return 'Email confirmation is enabled but SMTP might not be working'
  }
  return 'Check Supabase Auth settings and SMTP configuration'
}

export const checkSupabaseAuthConfig = async () => {
  try {
    // Check if we can get session (tests basic auth setup)
    const { data: session } = await supabase.auth.getSession()
    
    return {
      authWorking: true,
      hasSession: !!session.session,
      message: 'Supabase Auth is configured correctly'
    }
  } catch (error) {
    return {
      authWorking: false,
      error: 'Supabase Auth configuration issue',
      details: error
    }
  }
}
