import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SaveState from '@/models/SaveState';
import { uploadSaveState, deleteSaveState, normalizeGameId, getPresignedScreenshotUrl } from '@/lib/r2';

const MAX_SAVES_PER_GAME = 5;

/**
 * POST /api/savestate
 * Save a new game state to R2 and record metadata in MongoDB
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, gameUrl, gameName, core, stateData, screenshotData } = body;

        console.log('API: Received save state request', {
            userId,
            gameUrl,
            stateLength: stateData?.length,
            screenshotLength: screenshotData?.length
        });

        // Validation
        if (!userId) {
            return NextResponse.json({ error: 'User ID (email) is required' }, { status: 400 });
        }
        if (!gameUrl) {
            return NextResponse.json({ error: 'Game URL is required' }, { status: 400 });
        }
        if (!stateData || !screenshotData) {
            return NextResponse.json({ error: 'State data and screenshot are required' }, { status: 400 });
        }

        const gameId = normalizeGameId(gameUrl);

        await connectDB();

        // Get existing saves for this user+game, sorted by creation date
        const existingSaves = await SaveState.find({ userId, gameId })
            .sort({ createdAt: 1 })
            .exec();

        // Determine slot number
        let slotNumber: number;

        if (existingSaves.length < MAX_SAVES_PER_GAME) {
            // Find the first available slot (1-5)
            const usedSlots = new Set(existingSaves.map(s => s.slotNumber));
            slotNumber = [1, 2, 3, 4, 5].find(n => !usedSlots.has(n)) || existingSaves.length + 1;
        } else {
            // Delete the oldest save to make room
            const oldestSave = existingSaves[0];
            slotNumber = oldestSave.slotNumber;

            // Delete from R2
            await deleteSaveState(userId, gameId, slotNumber);

            // Delete from MongoDB
            await SaveState.findByIdAndDelete(oldestSave._id);
        }

        // Convert base64 data to Buffers
        const stateBuffer = Buffer.from(stateData, 'base64');
        const screenshotBuffer = Buffer.from(screenshotData, 'base64');

        // Upload to R2
        const { stateUrl, screenshotUrl } = await uploadSaveState(
            userId,
            gameId,
            slotNumber,
            stateBuffer,
            screenshotBuffer
        );

        // Create new save record in MongoDB
        const newSave = new SaveState({
            userId,
            gameId,
            slotNumber,
            stateUrl,
            screenshotUrl,
            core: core || 'unknown',
            gameName: gameName || gameId,
        });

        await newSave.save();

        return NextResponse.json({
            success: true,
            message: 'Save state created successfully',
            saveState: {
                id: newSave._id,
                slotNumber: newSave.slotNumber,
                screenshotUrl: newSave.screenshotUrl,
                createdAt: newSave.createdAt,
            },
        });

    } catch (error) {
        console.error('Save state API error:', error);
        return NextResponse.json(
            { error: 'Failed to save game state' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/savestate?userId=...&gameUrl=...
 * List all save states for a specific user and game
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const gameUrl = searchParams.get('gameUrl');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }
        if (!gameUrl) {
            return NextResponse.json({ error: 'Game URL is required' }, { status: 400 });
        }

        const gameId = normalizeGameId(gameUrl);

        await connectDB();

        const saves = await SaveState.find({ userId, gameId })
            .sort({ slotNumber: 1 })
            .exec();

        // Generate presigned URLs for screenshots
        const savesWithUrls = await Promise.all(
            saves.map(async (save) => {
                const presignedScreenshotUrl = await getPresignedScreenshotUrl(
                    userId,
                    gameId,
                    save.slotNumber
                );
                return {
                    id: save._id,
                    slotNumber: save.slotNumber,
                    screenshotUrl: presignedScreenshotUrl,
                    gameName: save.gameName,
                    core: save.core,
                    createdAt: save.createdAt,
                    updatedAt: save.updatedAt,
                };
            })
        );

        return NextResponse.json({
            success: true,
            gameId,
            saves: savesWithUrls,
        });

    } catch (error) {
        console.error('Get save states error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve save states' },
            { status: 500 }
        );
    }
}
