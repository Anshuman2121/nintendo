import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GameplaySession, { IGameplaySession } from '@/models/GameplaySession';
import SaveState from '@/models/SaveState';
import { getPresignedScreenshotUrl } from '@/lib/r2';

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

        // Parallel fetch: sessions and saves
        const [sessionsComp, savesComp] = await Promise.all([
            // Fetch user sessions sorted by last played
            GameplaySession.find({ email: decodedEmail })
                .sort({ last_played: -1 })
                .lean<IGameplaySession[]>(),

            // Fetch user saves sorted by updated time (recent first)
            SaveState.find({ userId: decodedEmail })
                .sort({ updatedAt: -1 })
                .lean()
        ]);

        // Calculate totals
        const totalPlayTime = sessionsComp.reduce((sum, s) => sum + (s.total_time_seconds || 0), 0);
        const gamesPlayed = sessionsComp.length;
        const totalSaves = savesComp.length;

        // Process saves to add presigned URLs
        const savesWithUrls = await Promise.all(
            savesComp.map(async (save) => {
                const presignedScreenshotUrl = await getPresignedScreenshotUrl(
                    decodedEmail,
                    save.gameId,
                    save.slotNumber
                );
                return {
                    id: save._id.toString(),
                    gameId: save.gameId,
                    gameName: save.gameName,
                    slotNumber: save.slotNumber,
                    screenshotUrl: presignedScreenshotUrl,
                    core: save.core,
                    createdAt: save.createdAt,
                    updatedAt: save.updatedAt,
                };
            })
        );

        return NextResponse.json({
            success: true,
            email: decodedEmail,
            totalPlayTime,
            gamesPlayed,
            totalSaves,
            sessions: sessionsComp,
            saves: savesWithUrls
        });

    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
