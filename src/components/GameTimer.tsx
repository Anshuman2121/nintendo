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
                className="absolute top-3 left-1/2 -translate-x-1/2 lg:top-4 lg:right-4 lg:left-auto lg:translate-x-0 p-2 cursor-pointer opacity-0 hover:opacity-100 transition-opacity z-[100]"
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
            className="absolute z-[100] cursor-pointer group top-1 left-1/2 -translate-x-1/2 lg:top-4 lg:right-4 lg:left-auto lg:translate-x-0"
            onClick={() => setIsVisible(false)}
            title="Click to hide"
        >
            <div className="px-3 py-1 text-[10px] lg:text-xs font-mono text-cyan-400 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] opacity-60 hover:opacity-100 transition-opacity">
                {formatPlayTime(currentTime)}
            </div>
        </div>
    );
}
