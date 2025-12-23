'use client';

import { useEffect, useRef } from 'react';
import { useGameplay } from '@/contexts/GameplayContext';
import GameTimer from './GameTimer';

interface EmulatorProps {
    gameUrl: string;
    core?: string;
    biosUrl?: string;
}

function detectCore(gameUrl: string): { core: string; biosUrl?: string } {
    const extension = gameUrl.split('.').pop()?.toLowerCase() || '';

    if (['fds', 'nes', 'unif', 'unf'].includes(extension)) {
        return { core: 'nes' };
    } else if (['smc', 'fig', 'sfc', 'gd3', 'gd7', 'dx2', 'bsx', 'swc'].includes(extension)) {
        return { core: 'snes' };
    } else if (['z64', 'n64'].includes(extension)) {
        return { core: 'n64' };
    } else if (['nds'].includes(extension)) {
        return { core: 'nds' };
    } else if (['gba'].includes(extension)) {
        return { core: 'gba' };
    } else if (['gb', 'gbc'].includes(extension)) {
        return { core: 'gb' };
    } else if (['smd', 'md'].includes(extension)) {
        return { core: 'segaCD', biosUrl: '/bios/SegaCDbios.bin' };
    } else if (extension === '7z') {
        return { core: 'psx', biosUrl: '/bios/psxbios.7z' };
    } else if (extension === 'zip') {
        return { core: 'dosbox_pure' };
    }

    return { core: 'nes' }; // Default fallback
}

export default function Emulator({ gameUrl, core: propCore, biosUrl: propBiosUrl }: EmulatorProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { startSession, endSession } = useGameplay();

    // Build the iframe URL with game parameters
    const { core: detectedCore, biosUrl: detectedBiosUrl } = detectCore(gameUrl);
    const finalCore = propCore || detectedCore;
    const finalBiosUrl = propBiosUrl || detectedBiosUrl || '';

    // Ensure gameUrl is properly encoded
    const params = new URLSearchParams({
        game: gameUrl,
        core: finalCore,
    });
    if (finalBiosUrl) {
        params.set('bios', finalBiosUrl);
    }

    const iframeSrc = `/emulator.html?${params.toString()}`;

    useEffect(() => {
        console.log('Emulator: Loading game via iframe:', gameUrl);
        console.log('Emulator: Core:', finalCore);

        // Start gameplay session tracking
        startSession(gameUrl);

        return () => {
            // End gameplay session when unmounting
            endSession();
        };
    }, [gameUrl, finalCore, startSession, endSession]);

    return (
        <div className="w-full h-full min-h-screen bg-black flex items-center justify-center relative">
            <GameTimer startTime={Date.now()} />
            <iframe
                ref={iframeRef}
                src={iframeSrc}
                className="w-full h-full border-0"
                style={{ minHeight: '100vh', minWidth: '100vw' }}
                allow="autoplay; fullscreen; gamepad"
                title="Game Emulator"
            />
        </div>
    );
}
