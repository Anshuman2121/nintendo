import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SaveState from '@/models/SaveState';
import { deleteSaveState, getPresignedStateUrl, getPresignedScreenshotUrl } from '@/lib/r2';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/savestate/[id]
 * Get presigned URLs for downloading a specific save state
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        await connectDB();

        const saveState = await SaveState.findById(id);

        if (!saveState) {
            return NextResponse.json({ error: 'Save state not found' }, { status: 404 });
        }

        // Generate presigned URLs for both state data and screenshot
        const [stateUrl, screenshotUrl] = await Promise.all([
            getPresignedStateUrl(saveState.userId, saveState.gameId, saveState.slotNumber),
            getPresignedScreenshotUrl(saveState.userId, saveState.gameId, saveState.slotNumber),
        ]);

        return NextResponse.json({
            success: true,
            saveState: {
                id: saveState._id,
                slotNumber: saveState.slotNumber,
                stateUrl,
                screenshotUrl,
                gameName: saveState.gameName,
                core: saveState.core,
                createdAt: saveState.createdAt,
            },
        });

    } catch (error) {
        console.error('Get save state error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve save state' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/savestate/[id]
 * Delete a specific save state from both R2 and MongoDB
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Verify user authorization via query param or header
        const { searchParams } = new URL(request.url);
        const requestUserId = searchParams.get('userId');

        if (!requestUserId) {
            return NextResponse.json({ error: 'User ID is required for deletion' }, { status: 400 });
        }

        await connectDB();

        const saveState = await SaveState.findById(id);

        if (!saveState) {
            return NextResponse.json({ error: 'Save state not found' }, { status: 404 });
        }

        // Verify the save belongs to the requesting user
        if (saveState.userId !== requestUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete from R2
        await deleteSaveState(saveState.userId, saveState.gameId, saveState.slotNumber);

        // Delete from MongoDB
        await SaveState.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Save state deleted successfully',
        });

    } catch (error) {
        console.error('Delete save state error:', error);
        return NextResponse.json(
            { error: 'Failed to delete save state' },
            { status: 500 }
        );
    }
}
