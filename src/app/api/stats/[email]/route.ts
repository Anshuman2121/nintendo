
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GameplaySession, { IGameplaySession } from '@/models/GameplaySession';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await params;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const decodedEmail = decodeURIComponent(email);

        await connectDB();

        // Fetch user sessions sorted by last played
        const sessions = await GameplaySession.find({ email: decodedEmail })
            .sort({ last_played: -1 })
            .lean<IGameplaySession[]>(); // Returns POJOs instead of Mongoose Docs

        // Calculate totals
        const totalPlayTime = sessions.reduce((sum, s) => sum + (s.total_time_seconds || 0), 0);
        const gamesPlayed = sessions.length;

        return NextResponse.json({
            success: true,
            email: decodedEmail,
            totalPlayTime,
            gamesPlayed,
            sessions
        });

    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
