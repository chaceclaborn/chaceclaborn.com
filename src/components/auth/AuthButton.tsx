'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';

export function AuthButton() {
  const { user, tier, loading, signInWithGoogle, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium">{user.displayName?.split(' ')[0]}</span>
          <span className="text-xs text-muted-foreground capitalize">{tier.name}</span>
        </div>
        <Avatar className="h-8 w-8 border border-primary/20">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {user.displayName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </motion.div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignIn}
      disabled={isSigningIn}
      className="border-primary/20 hover:bg-primary hover:text-primary-foreground"
    >
      {isSigningIn ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4 mr-2" />
      )}
      Sign In
    </Button>
  );
}
