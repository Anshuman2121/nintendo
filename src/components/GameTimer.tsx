'use client';

import { useState, useEffect } from 'react';
import { useGameplay } from '@/contexts/GameplayContext';
import { formatPlayTime } from '@/lib/formatTime';

interface GameTimerProps {
    startTime: number;
}

export default function GameTimer({ startTime }: GameTimerProps) {
    const { initialPlayTime } = useGameplay();
    const [currentTime, setCurrentTime] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Reset timer when startTime changes
        setCurrentTime(initialPlayTime);

        const interval = setInterval(() => {
            const now = Date.now();
            const sessionDuration = Math.floor((now - startTime) / 1000);
            setCurrentTime(initialPlayTime + sessionDuration);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, initialPlayTime]);

    if (!isVisible) {
        return (
            <div
                className="absolute top-0 right-0 p-2 cursor-pointer opacity-0 hover:opacity-100 transition-opacity z-[100]"
                onClick={() => setIsVisible(true)}
                title="Show Timer"
            >
                <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <span className="text-white text-xs">🕒</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="absolute top-4 right-4 z-[100] cursor-pointer group"
            onClick={() => setIsVisible(false)}
            title="Click to hide"
        >
            <div className="bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-full px-3 py-1 text-xs font-mono text-cyan-400 group-hover:bg-black/90 group-hover:border-purple-500/50 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                {formatPlayTime(currentTime)}
            </div>
        </div>
    );
}
