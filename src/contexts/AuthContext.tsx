'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
    User,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    AuthError,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);



    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            setIsSigningIn(false);
        });

        return unsubscribe;
    }, []);

    // Get user-friendly error messages
    const getErrorMessage = (errorCode: string): string => {
        const errorMessages: Record<string, string> = {
            'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
            'auth/popup-blocked': 'Popup was blocked. Please allow popups or try again.',
            'auth/cancelled-popup-request': 'Sign-in was cancelled.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/operation-not-allowed': 'Google sign-in is not enabled.',
            'auth/redirect-cancelled-by-user': 'Sign-in was cancelled.',
        };
        return errorMessages[errorCode] || 'An error occurred during sign-in. Please try again.';
    };

    // Sign in with Google using Popup (Modern SPA approach)
    // This opens a popup window, user signs in, and popup closes.
    // No page reload required.
    const signInWithGoogle = useCallback(async () => {
        if (isSigningIn) return;

        setIsSigningIn(true);
        setError(null);

        try {
            // Use popup-based sign-in
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            const authError = err as AuthError;
            // Ignore popup closed by user error in console, just show toast
            if (authError.code !== 'auth/popup-closed-by-user') {
                console.error('Error initiating Google sign-in:', authError);
            }
            setError(getErrorMessage(authError.code));
        } finally {
            setIsSigningIn(false);
        }
    }, [isSigningIn]);

    const signOut = useCallback(async () => {
        try {
            await firebaseSignOut(auth);
            setError(null);
        } catch (err) {
            console.error('Error signing out:', err);
            setError('Failed to sign out. Please try again.');
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                signInWithGoogle,
                signOut,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
