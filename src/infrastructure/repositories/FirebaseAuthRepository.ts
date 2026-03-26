import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle as firebaseSignIn, logout as firebaseLogout } from '../../firebase';
import { UserProfile } from '../../domain/entities';
import { IAuthRepository } from '../../domain/repositories';

/**
 * Firebase implementation of IAuthRepository
 */
export class FirebaseAuthRepository implements IAuthRepository {
  async getCurrentUser(): Promise<UserProfile | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      
      // Create user profile if doesn't exist
      const newUserProfile: UserProfile = {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        createdAt: new Date().toISOString(),
        role: 'user'
      };
      
      await setDoc(userRef, newUserProfile);
      await setDoc(doc(db, 'users', currentUser.uid, 'private', 'settings'), {
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      });
      
      return newUserProfile;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  subscribe(callback: (user: UserProfile | null) => void): () => void {
    const unsubscribe = onAuthStateChanged(auth, async (u: User | null) => {
      if (u) {
        // Sync user profile
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        let userProfile: UserProfile;
        
        if (!userSnap.exists()) {
          userProfile = {
            uid: u.uid,
            displayName: u.displayName,
            photoURL: u.photoURL,
            createdAt: new Date().toISOString(),
            role: 'user'
          };
          await setDoc(userRef, userProfile);
          await setDoc(doc(db, 'users', u.uid, 'private', 'settings'), {
            email: u.email,
            updatedAt: new Date().toISOString()
          });
        } else {
          userProfile = userSnap.data() as UserProfile;
        }
        
        callback(userProfile);
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  }

  async signInWithGoogle(): Promise<void> {
    await firebaseSignIn();
  }

  async signOut(): Promise<void> {
    await firebaseLogout();
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, data, { merge: true });
  }
}
