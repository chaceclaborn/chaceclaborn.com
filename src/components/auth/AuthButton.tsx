'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function AuthButton() {
  const { user, tier, loading, signInWithGoogle, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [imageError, setImageError] = useState(false);

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
    const showPhoto = user.photoURL && !imageError;

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
        <div className="relative h-8 w-8 rounded-full overflow-hidden border border-primary/20 bg-primary">
          {showPhoto ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-primary-foreground text-xs font-medium">
              {user.displayName?.charAt(0) || 'U'}
            </div>
          )}
        </div>
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
