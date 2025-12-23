'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, User, Loader2, X } from 'lucide-react';
import Image from 'next/image';

export default function AuthButton() {
    const { user, loading, error, signInWithGoogle, signOut, clearError } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-dismiss error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    const handleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await signInWithGoogle();
        } finally {
            // Give a small delay before hiding loader for better UX
            setTimeout(() => setIsSigningIn(false), 500);
        }
    };

    // Show loading skeleton during initial auth check
    if (loading) {
        return (
            <div className="w-24 h-10 rounded-full bg-white/10 animate-pulse" />
        );
    }

    // Not signed in - show sign in button
    if (!user) {
        return (
            <div className="relative">
                <button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isSigningIn ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <LogIn size={18} />
                    )}
                    <span className="hidden sm:inline">
                        {isSigningIn ? 'Signing in...' : 'Sign In'}
                    </span>
                </button>

                {/* Error Toast */}
                {error && (
                    <div className="absolute top-full right-0 mt-2 w-64 p-3 rounded-lg bg-red-500/90 backdrop-blur-sm text-white text-sm shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-start gap-2">
                            <p className="flex-1">{error}</p>
                            <button
                                onClick={clearError}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Signed in - show user profile dropdown
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 border border-purple-500/30"
            >
                {user.photoURL ? (
                    <Image
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                        unoptimized
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                        <User size={20} className="text-white" />
                    </div>
                )}
                <span className="hidden md:block text-white font-medium max-w-[150px] truncate">
                    {user.displayName || user.email}
                </span>
            </button>

            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-black/95 backdrop-blur-md border border-purple-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)] overflow-hidden z-50">
                    <div className="p-4 border-b border-purple-500/30">
                        <div className="flex items-center gap-3">
                            {user.photoURL ? (
                                <Image
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    width={48}
                                    height={48}
                                    className="rounded-full"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                                    <User size={24} className="text-white" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{user.displayName}</p>
                                <p className="text-gray-400 text-sm truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            signOut();
                            setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-2 text-white hover:bg-white/10 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    );
}
