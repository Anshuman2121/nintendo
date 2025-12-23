'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Emulator from '@/components/Emulator';

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
            {/* Background glow effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Loading card */}
            <div className="relative z-10 flex flex-col items-center gap-8 p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                {/* Spinner */}
                <div className="relative w-24 h-24">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-purple-500 animate-spin" />
                    {/* Middle ring */}
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-green-400 border-l-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                    {/* Inner ring */}
                    <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" style={{ animationDuration: '0.6s' }} />
                    {/* Center dot */}
                    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 animate-pulse" />
                </div>

                {/* Text */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-2">
                        Loading Game
                    </h2>
                    <p className="text-gray-400 text-sm animate-pulse">
                        Initializing emulator...
                    </p>
                </div>

                {/* Loading bar */}
                <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 rounded-full animate-loading-bar" />
                </div>
            </div>

            {/* CSS for loading bar animation */}
            <style jsx>{`
                @keyframes loading-bar {
                    0% { width: 0%; transform: translateX(0); }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
                .animate-loading-bar {
                    animation: loading-bar 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

function NoGameScreen() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">No game selected</h1>
                <a href="/" className="text-cyan-400 hover:underline">
                    Go back to game list
                </a>
            </div>
        </div>
    );
}

function PlayContent() {
    const searchParams = useSearchParams();
    const gameUrl = searchParams.get('game');

    if (!gameUrl) {
        return <NoGameScreen />;
    }

    const decodedUrl = decodeURIComponent(gameUrl);

    // Render Emulator directly - no hiding, let EmulatorJS handle its own loading state
    return <Emulator gameUrl={decodedUrl} />;
}

export default function PlayPage() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <PlayContent />
        </Suspense>
    );
}
