'use client';

import { useEffect, useRef, useCallback } from 'react';

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
        return { core: 'segaCD', biosUrl: '/games/SegaCDbios.bin' };
    } else if (extension === '7z') {
        return { core: 'psx', biosUrl: '/games/psxbios.7z' };
    } else if (extension === 'zip') {
        return { core: 'dosbox_pure' };
    }

    return { core: 'nes' }; // Default fallback
}

// Cleanup function to remove all EmulatorJS globals and elements
function cleanupEmulator() {
    const win = window as unknown as Record<string, unknown>;

    // Remove the emulator instance
    if (win.EJS_emulator) {
        try {
            // Try to properly destroy the emulator if it has a destroy method
            const emulator = win.EJS_emulator as { destroy?: () => void };
            if (typeof emulator.destroy === 'function') {
                emulator.destroy();
            }
        } catch (e) {
            console.warn('Error destroying emulator:', e);
        }
    }

    // Clear all EJS globals
    const ejsKeys = Object.keys(win).filter(key => key.startsWith('EJS_'));
    ejsKeys.forEach(key => {
        delete win[key];
    });

    // Remove any scripts added by the emulator
    const scripts = document.querySelectorAll('script[src*="/data/"]');
    scripts.forEach(script => script.remove());

    // Remove any styles added by the emulator
    const styles = document.querySelectorAll('link[href*="/data/"]');
    styles.forEach(style => style.remove());
}

export default function Emulator({ gameUrl, core: propCore, biosUrl: propBiosUrl }: EmulatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptRef = useRef<HTMLScriptElement | null>(null);
    const initializedRef = useRef(false);

    const initEmulator = useCallback(() => {
        if (initializedRef.current || !containerRef.current) return;

        const { core: detectedCore, biosUrl: detectedBiosUrl } = detectCore(gameUrl);
        const finalCore = propCore || detectedCore;
        const finalBiosUrl = propBiosUrl || detectedBiosUrl || '';

        // Ensure gameUrl has leading slash for absolute path if it is local
        let absoluteGameUrl = gameUrl;
        if (!gameUrl.startsWith('http') && !gameUrl.startsWith('/')) {
            absoluteGameUrl = '/' + gameUrl;
        }
        console.log('Emulator: Loading game from URL:', absoluteGameUrl);
        console.log('Emulator: Detected core:', finalCore);

        const win = window as unknown as Record<string, unknown>;

        // Set EmulatorJS globals BEFORE loading the script
        win.EJS_player = '#game';
        win.EJS_gameUrl = absoluteGameUrl;
        win.EJS_core = finalCore;
        win.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
        win.EJS_biosUrl = finalBiosUrl;
        win.EJS_startOnLoaded = true; // Auto start
        win.EJS_color = '#1e90ff'; // Optional: customize theme color
        win.EJS_threads = true; // Enable threading (required for dosbox_pure)


        console.log('Emulator: Configuration set, loading script...');

        // Create and load the EmulatorJS loader script
        const script = document.createElement('script');
        script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
        script.async = true;

        script.onload = () => {
            console.log('Emulator: Loader script loaded successfully');
        };

        script.onerror = () => {
            console.error('Failed to load EmulatorJS loader script');
        };

        document.body.appendChild(script);
        scriptRef.current = script;
        initializedRef.current = true;
    }, [gameUrl, propCore, propBiosUrl]);

    useEffect(() => {
        // Small delay to ensure DOM is fully ready
        const timer = setTimeout(() => {
            initEmulator();
        }, 100);

        return () => {
            clearTimeout(timer);
            // Full cleanup on unmount
            cleanupEmulator();
            initializedRef.current = false;
        };
    }, [initEmulator]);

    return (
        <div className="w-full h-full min-h-screen bg-black flex items-center justify-center">
            <div
                ref={containerRef}
                id="game"
                className="w-full h-full"
                style={{ minHeight: '100vh', minWidth: '100vw' }}
            />
        </div>
    );
}
