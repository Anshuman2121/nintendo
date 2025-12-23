'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameplay } from '@/contexts/GameplayContext';
import { useAuth } from '@/contexts/AuthContext';
import GameTimer from './GameTimer';
import SaveStateModal from './SaveStateModal';

interface EmulatorProps {
    gameUrl: string;
    core?: string;
    biosUrl?: string;
    gameName?: string;
}

interface SaveStateInfo {
    id: string;
    slotNumber: number;
    screenshotUrl: string;
    gameName: string;
    core: string;
    createdAt: string;
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

export default function Emulator({ gameUrl, core: propCore, biosUrl: propBiosUrl, gameName }: EmulatorProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { startSession, endSession } = useGameplay();
    const { user } = useAuth();

    // Save state modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saveStates, setSaveStates] = useState<SaveStateInfo[]>([]);
    const [isLoadingSaves, setIsLoadingSaves] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

    // Show notification
    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // Fetch save states for current game
    const fetchSaveStates = useCallback(async () => {
        if (!user?.email) return;

        setIsLoadingSaves(true);
        try {
            const response = await fetch(
                `/api/savestate?userId=${encodeURIComponent(user.email)}&gameUrl=${encodeURIComponent(gameUrl)}`
            );
            const data = await response.json();
            if (data.success) {
                setSaveStates(data.saves);
            }
        } catch (error) {
            console.error('Failed to fetch save states:', error);
        } finally {
            setIsLoadingSaves(false);
        }
    }, [user?.email, gameUrl]);

    // Handle save state from iframe
    const handleSaveState = useCallback(async (payload: {
        gameUrl: string;
        core: string;
        screenshotData: string;
        stateData: string;
    }) => {
        if (!user?.email) {
            showNotification('Please log in to save game states', 'error');
            return;
        }

        if (isSaving) {
            console.log('Save in progress, ignoring request');
            return;
        }

        setIsSaving(true);
        showNotification('Saving game...', 'success'); // Show immediate feedback

        try {
            const response = await fetch('/api/savestate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.email,
                    gameUrl: payload.gameUrl,
                    gameName: gameName || payload.gameUrl.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Unknown Game',
                    core: payload.core,
                    stateData: payload.stateData,
                    screenshotData: payload.screenshotData,
                }),
            });

            const data = await response.json();
            if (data.success) {
                showNotification(`Game saved to slot ${data.saveState.slotNumber}`, 'success');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Failed to save state:', error);
            showNotification('Failed to save game state', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [user?.email, gameName, showNotification, isSaving]);

    // Handle load state request from iframe
    const handleLoadStateRequest = useCallback(async () => {
        if (!user?.email) {
            showNotification('Please log in to load game states', 'error');
            return;
        }
        await fetchSaveStates();
        setIsModalOpen(true);
    }, [user?.email, fetchSaveStates, showNotification]);

    // Load a specific save state
    const handleLoadState = useCallback(async (saveId: string) => {
        try {
            const response = await fetch(`/api/savestate/${saveId}`);
            const data = await response.json();

            if (data.success) {
                // Fetch the actual state data from the presigned URL
                const stateResponse = await fetch(data.saveState.stateUrl);
                const stateBlob = await stateResponse.arrayBuffer();
                const stateBase64 = btoa(
                    new Uint8Array(stateBlob).reduce((data, byte) => data + String.fromCharCode(byte), '')
                );

                // Send state data to iframe
                iframeRef.current?.contentWindow?.postMessage({
                    type: 'LOAD_STATE_DATA',
                    payload: { stateData: stateBase64 }
                }, '*');

                setIsModalOpen(false);
                showNotification('Game state loaded successfully', 'success');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Failed to load state:', error);
            showNotification('Failed to load game state', 'error');
        }
    }, [showNotification]);

    // Delete a save state
    const handleDeleteState = useCallback(async (saveId: string) => {
        if (!user?.email) return;

        try {
            const response = await fetch(
                `/api/savestate/${saveId}?userId=${encodeURIComponent(user.email)}`,
                { method: 'DELETE' }
            );
            const data = await response.json();

            if (data.success) {
                setSaveStates(prev => prev.filter(s => s.id !== saveId));
                showNotification('Save state deleted', 'success');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Failed to delete state:', error);
            showNotification('Failed to delete save state', 'error');
        }
    }, [user?.email, showNotification]);

    // Listen for messages from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!event.data || typeof event.data.type !== 'string') return;

            switch (event.data.type) {
                case 'SAVE_STATE':
                    console.log('Emulator: Received SAVE_STATE message', {
                        screenshotLen: event.data.payload.screenshotData?.length,
                        stateLen: event.data.payload.stateData?.length
                    });
                    handleSaveState(event.data.payload);
                    break;
                case 'SAVE_STATE_ERROR':
                    showNotification('Error creating save state', 'error');
                    break;
                case 'LOAD_STATE_REQUEST':
                    handleLoadStateRequest();
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleSaveState, handleLoadStateRequest, showNotification]);

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

            {/* Notification Toast */}
            {notification && (
                <div
                    className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-fade-in ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                        }`}
                >
                    {notification.message}
                </div>
            )}

            {/* Save State Modal */}
            <SaveStateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                saves={saveStates}
                onLoadState={handleLoadState}
                onDeleteState={handleDeleteState}
                isLoading={isLoadingSaves}
            />

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

