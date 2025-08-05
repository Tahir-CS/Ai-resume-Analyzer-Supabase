import { supabase } from '../lib/supabase'

export const testEmailConfiguration = async () => {
  try {
    // Test signup with a dummy email to check configuration
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test123456',
    })

    if (error) {
      console.error('Email configuration test failed:', error.message)
      return {
        configured: false,
        error: error.message,
        suggestion: getEmailConfigSuggestion(error.message)
      }
    }

    return {
      configured: true,
      message: 'Email configuration appears to be working'
    }
  } catch (error) {
    return {
      configured: false,
      error: 'Failed to test email configuration',
      suggestion: 'Check your Supabase project settings'
    }
  }
}

const getEmailConfigSuggestion = (errorMessage: string) => {
  if (errorMessage.includes('email')) {
    return 'Check your SMTP settings in Supabase Dashboard → Settings → Auth'
  }
  if (errorMessage.includes('confirmation')) {
    return 'Email confirmations might be enabled. Consider disabling for development in Auth settings.'
  }
  return 'Check your Supabase project configuration and auth settings.'
}

export const getEmailConfigInstructions = () => {
  return {
    development: {
      title: "For Development (Quick Fix)",
      steps: [
        "1. Go to Supabase Dashboard → Authentication → Settings",
        "2. Under 'User Signups', turn OFF 'Enable email confirmations'",
        "3. Save settings and try signing up again"
      ]
    },
    production: {
      title: "For Production (Proper Setup)",
      steps: [
        "1. Go to Supabase Dashboard → Settings → Auth",
        "2. Configure SMTP settings with your email provider",
        "3. Set up proper Site URL and Redirect URLs",
        "4. Test email delivery with a real email address"
      ]
    },
    commonIssues: [
      "Check spam folder for confirmation emails",
      "Verify email provider allows SMTP",
      "Check if rate limits are being hit",
      "Ensure Site URL matches your domain"
    ]
  }
}
