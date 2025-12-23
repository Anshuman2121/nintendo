
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GameplaySession from '@/models/GameplaySession';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, email, gameName, timeSeconds } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        if (!gameName) {
            return NextResponse.json({ error: 'Game name is required' }, { status: 400 });
        }

        await connectDB();

        // Find or create session
        let session = await GameplaySession.findOne({ email, game_name: gameName });

        if (!session) {
            session = new GameplaySession({
                email,
                game_name: gameName,
                total_time_seconds: 0,
                last_played: new Date()
            });
        }

        const now = new Date();

        switch (action) {
            case 'start':
                session.last_played = now;
                await session.save();
                return NextResponse.json({
                    success: true,
                    message: 'Session started',
                    totalTime: session.total_time_seconds
                });

            case 'heartbeat':
                if (typeof timeSeconds !== 'number' || timeSeconds <= 0) {
                    return NextResponse.json({ error: 'Valid timeSeconds required' }, { status: 400 });
                }
                session.total_time_seconds += timeSeconds;
                session.last_played = now;
                await session.save();
                return NextResponse.json({ success: true, message: 'Session updated' });

            case 'end':
                if (typeof timeSeconds === 'number' && timeSeconds > 0) {
                    session.total_time_seconds += timeSeconds;
                }
                session.last_played = now;
                await session.save();
                return NextResponse.json({ success: true, message: 'Session ended' });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('Session API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
