'use client';

import { createContext, useContext, useRef, useCallback, ReactNode, useState } from 'react';
import { useAuth } from './AuthContext';
import { extractGameName } from '@/lib/formatTime';

interface GameplayContextType {
    startSession: (gameUrl: string) => void;
    endSession: () => void;
    currentGame: string | null;
    initialPlayTime: number;
}

const GameplayContext = createContext<GameplayContextType | undefined>(undefined);

// Heartbeat interval in milliseconds (2 minutes)
const HEARTBEAT_INTERVAL = 2 * 60 * 1000;

export function GameplayProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const currentGameRef = useRef<string | null>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const sessionStartTimeRef = useRef<number>(0);
    const lastHeartbeatTimeRef = useRef<number>(0);

    // State for initial playtime from DB
    const [initialPlayTime, setInitialPlayTime] = useState<number>(0);

    // Send session action to API
    const sendSessionAction = useCallback(async (action: 'start' | 'heartbeat' | 'end', timeSeconds?: number) => {
        if (!user?.email || !currentGameRef.current) return;

        try {
            const res = await fetch('/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    email: user.email,
                    gameName: currentGameRef.current,
                    timeSeconds: timeSeconds || 0
                })
            });

            if (action === 'start' && res.ok) {
                const data = await res.json();
                if (typeof data.totalTime === 'number') {
                    setInitialPlayTime(data.totalTime);
                }
            }
        } catch (error) {
            console.error(`Failed to send ${action} session:`, error);
        }
    }, [user?.email]);

    // Start a gameplay session
    const startSession = useCallback((gameUrl: string) => {
        if (!user?.email) return;

        // Clean up any existing session
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }

        const gameName = extractGameName(gameUrl);
        currentGameRef.current = gameName;
        sessionStartTimeRef.current = Date.now();
        lastHeartbeatTimeRef.current = Date.now();

        // Reset initial playtime while we fetch the real one
        setInitialPlayTime(0);

        console.log(`[Gameplay] Starting session for: ${gameName}`);
        sendSessionAction('start');

        // Set up heartbeat interval
        heartbeatIntervalRef.current = setInterval(() => {
            const now = Date.now();
            const timeSinceLastHeartbeat = Math.floor((now - lastHeartbeatTimeRef.current) / 1000);
            lastHeartbeatTimeRef.current = now;

            console.log(`[Gameplay] Heartbeat: ${timeSinceLastHeartbeat}s for ${currentGameRef.current}`);
            sendSessionAction('heartbeat', timeSinceLastHeartbeat);
        }, HEARTBEAT_INTERVAL);
    }, [user?.email, sendSessionAction]);

    // End the current session
    const endSession = useCallback(() => {
        if (!currentGameRef.current) return;

        // Clear the heartbeat interval
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }

        // Calculate remaining time since last heartbeat
        const now = Date.now();
        const remainingTime = Math.floor((now - lastHeartbeatTimeRef.current) / 1000);

        console.log(`[Gameplay] Ending session for: ${currentGameRef.current}, remaining time: ${remainingTime}s`);
        sendSessionAction('end', remainingTime);

        currentGameRef.current = null;
        sessionStartTimeRef.current = 0;
        lastHeartbeatTimeRef.current = 0;
        setInitialPlayTime(0);
    }, [sendSessionAction]);

    return (
        <GameplayContext.Provider
            value={{
                startSession,
                endSession,
                currentGame: currentGameRef.current,
                initialPlayTime
            }}
        >
            {children}
        </GameplayContext.Provider>
    );
}

export function useGameplay() {
    const context = useContext(GameplayContext);
    if (context === undefined) {
        throw new Error('useGameplay must be used within a GameplayProvider');
    }
    return context;
}
