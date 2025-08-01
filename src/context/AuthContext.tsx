

'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type Auth, type UserCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User, UserProfile } from '@/lib/types';
import { createUserProfile, getUserProfile } from '@/services/walletService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string, username: string, referredByCode?: string) => Promise<UserCredential>;
  logIn: (email: string, pass: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check user status from Firestore
        const userProfile = await getUserProfile(user.uid);
        if (userProfile && userProfile.status === 'banned') {
          await signOut(auth);
          setUser(null);
          toast({
              title: 'Access Denied',
              description: 'Your account has been permanently banned. Please contact support.',
              variant: 'destructive',
              duration: 10000,
          });
        } else if (userProfile && userProfile.status === 'suspended') {
            const now = new Date();
            const suspendedUntil = userProfile.suspendedUntil?.toDate();
            if (suspendedUntil && suspendedUntil > now) {
                 await signOut(auth);
                 setUser(null);
                 toast({
                    title: 'Account Suspended',
                    description: `Your account is suspended until ${suspendedUntil.toLocaleString()}. Please contact support for assistance.`,
                    variant: 'destructive',
                    duration: 10000,
                 });
            } else {
                setUser(user);
            }
        } else {
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const signUp = async (email: string, pass: string, username: string, referredByCode?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await createUserProfile(userCredential.user.uid, email, username, referredByCode);
    return userCredential;
  };
  
  const logIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const logOut = () => {
    return signOut(auth);
  }

  const value = {
    user,
    loading,
    signUp,
    logIn,
    logOut
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
