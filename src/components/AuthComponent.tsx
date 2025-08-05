import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'

interface AuthComponentProps {
  redirectTo?: string
}

export const AuthComponent: React.FC<AuthComponentProps> = ({ redirectTo }) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  useEffect(() => {
    // Listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setMessage({
          type: 'success',
          text: 'Successfully signed in with Google!'
        })
      } else if (event === 'SIGNED_OUT') {
        setMessage(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md glass-morphism">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to AI Resume Analyzer
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in with Google to analyze your resume and get personalized feedback
          </CardDescription>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Quick and secure authentication with your Google account
          </div>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
              {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
              {message.type === 'info' && <Mail className="h-4 w-4" />}
              <span>{message.text}</span>
            </div>
          )}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#1d4ed8',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#f8fafc',
                    defaultButtonBackgroundHover: '#f1f5f9',
                    inputBackground: 'white',
                    inputBorder: '#e2e8f0',
                    inputBorderHover: '#cbd5e1',
                    inputBorderFocus: '#3b82f6',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              className: {
                container: 'space-y-4',
                button: 'w-full transition-all duration-200 hover:shadow-md',
                input: 'w-full transition-all duration-200',
                label: 'text-sm font-medium text-gray-700',
                message: 'text-sm',
              },
            }}
            providers={['google']}
            onlyThirdPartyProviders={true}
            redirectTo={redirectTo || `${window.location.origin}/`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
