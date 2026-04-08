import { UserProfile } from '../entities';

/**
 * Repository interface for Authentication operations
 */
export interface IAuthRepository {
  /**
   * Get current authenticated user ID (synchronous)
   */
  getCurrentUserId(): string | null;
  
  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<UserProfile | null>;
  
  /**
   * Subscribe to auth state changes
   */
  subscribe(callback: (user: UserProfile | null) => void): () => void;
  
  /**
   * Sign in with Google
   */
  signInWithGoogle(): Promise<void>;
  
  /**
   * Sign out
   */
  signOut(): Promise<void>;
  
  /**
   * Update user profile
   */
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<void>;
}
