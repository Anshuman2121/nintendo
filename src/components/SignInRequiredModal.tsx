'use client';

import { useAuth } from '@/contexts/AuthContext';
import { X, Gamepad2, LogIn, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SignInRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameName?: string;
}

export default function SignInRequiredModal({ isOpen, onClose, gameName }: SignInRequiredModalProps) {
    const { signInWithGoogle } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);

    if (!isOpen) return null;

    const handleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await signInWithGoogle();
            onClose();
        } catch (error) {
            console.error('Sign in error:', error);
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_50px_rgba(139,92,246,0.3)]"
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300 z-20"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full filter blur-[60px]" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full filter blur-[60px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.5)] animate-pulse">
                        <Gamepad2 className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Sign In to Play
                    </h2>

                    {/* Subtitle */}
                    <p className="text-gray-400 mb-2">
                        Create an account to track your gameplay and save progress
                    </p>

                    {/* Game name if provided */}
                    {gameName && (
                        <p className="text-purple-400 text-sm mb-6">
                            Ready to play: <span className="font-semibold text-cyan-400">{gameName}</span>
                        </p>
                    )}

                    {!gameName && <div className="mb-6" />}

                    {/* Features list */}
                    <div className="w-full mb-6 space-y-3 text-left">
                        <div className="flex items-center gap-3 text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400">✓</span>
                            </div>
                            <span>Track your play time for each game</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400">✓</span>
                            </div>
                            <span>View your gaming dashboard</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400">✓</span>
                            </div>
                            <span>See your gaming history</span>
                        </div>
                    </div>

                    {/* Sign in button */}
                    <button
                        onClick={handleSignIn}
                        disabled={isSigningIn}
                        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-semibold text-lg shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                    >
                        {isSigningIn ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <LogIn size={24} />
                                <span>Sign In with Google</span>
                            </>
                        )}
                    </button>

                    {/* Skip text */}
                    <p className="mt-4 text-gray-500 text-sm">
                        By signing in, you agree to our terms of service
                    </p>
                </div>

                {/* Bottom gradient decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
            </div>
        </div>
    );
}
