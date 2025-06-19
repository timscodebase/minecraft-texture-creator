import { useState, useEffect } from 'react';
import { onAuthChange, signInWithGoogle, signOutUser } from '../utils/firebase';

export function useAuth() {
  const [user, setUser] = useState<null | { uid: string; displayName?: string | null }>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, displayName: firebaseUser.displayName });
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  return {
    user,
    isAuthReady,
    signIn: signInWithGoogle,
    signOut: signOutUser,
  };
}
