import { useState, useEffect } from 'react';
import { UserProfile } from '../../domain/entities';
import { authService } from '../../infrastructure';

interface UseAuthResult {
  user: UserProfile | null;
  isAuthReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
}

/**
 * Hook for authentication using clean architecture
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setUser(user);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const updateProfile = async (userId: string, data: Partial<UserProfile>) => {
    await authService.updateProfile(userId, data);
  };

  return { user, isAuthReady, signInWithGoogle, signOut, updateProfile };
}
