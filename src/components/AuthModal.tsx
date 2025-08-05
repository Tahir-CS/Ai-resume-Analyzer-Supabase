import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { X } from 'lucide-react'
import { Button } from './ui/button'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  redirectTo?: string
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, redirectTo }) => {
  console.log('AuthModal render:', { open, supabaseExists: !!supabase });
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-center text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to AI Resume Analyzer
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Sign in to analyze your resume and get personalized feedback
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
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
                    borderRadiusButton: '6px',
                    buttonBorderRadius: '6px',
                    inputBorderRadius: '6px',
                  },
                },
              },
              className: {
                container: 'space-y-3',
                button: 'w-full transition-all duration-200 hover:shadow-md text-sm',
                input: 'w-full transition-all duration-200 text-sm',
                label: 'text-sm font-medium text-gray-700',
                message: 'text-xs',
              },
            }}
            providers={['google', 'github']}
            redirectTo={redirectTo || `${window.location.origin}/`}
            magicLink={false}
            showLinks={true}
            onlyThirdPartyProviders={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
