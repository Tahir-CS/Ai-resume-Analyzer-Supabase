import { FileText, Sparkles, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface HeaderProps {
  onSignInClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignInClick }) => {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <a href="/" className="flex items-center gap-3 transition-all duration-200 hover:scale-105">
              <div className="relative">
                <FileText className="h-8 w-8 text-blue-600" />
                <Sparkles className="h-4 w-4 text-purple-500 absolute -top-1 -right-1" />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ResumeAI
              </span>
            </a>
            
            {!loading && (
              <div className="flex items-center gap-4">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                          <AvatarFallback>
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.user_metadata?.full_name || 'User'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="outline" 
                    className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200"
                    onClick={onSignInClick}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
