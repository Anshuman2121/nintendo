import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 Configuration from environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'nintendo';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Optional: for public access

// Validate configuration
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.warn('R2 credentials not fully configured. Save states will not work.');
}

// Create S3-compatible client for Cloudflare R2
const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
    },
});

/**
 * Generate a normalized game ID from a game URL
 * Strips path, query params, and normalizes for use as storage key
 */
export function normalizeGameId(gameUrl: string): string {
    try {
        // Extract filename from URL
        const url = new URL(gameUrl, 'http://localhost');
        const pathname = url.pathname;
        const filename = pathname.split('/').pop() || 'unknown';

        // Remove extension and normalize
        const baseName = filename.replace(/\.[^/.]+$/, '');
        return baseName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    } catch {
        // Fallback: hash the URL
        return gameUrl.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    }
}

/**
 * Generate the R2 storage path for save state files
 */
function getSaveStatePath(userId: string, gameId: string, slotNumber: number, fileType: 'state' | 'screenshot'): string {
    const extension = fileType === 'screenshot' ? 'png' : 'state';
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_@.-]/g, '_');
    return `savestates/${sanitizedUserId}/${gameId}/slot${slotNumber}.${extension}`;
}

/**
 * Upload save state data to R2
 */
export async function uploadSaveState(
    userId: string,
    gameId: string,
    slotNumber: number,
    stateData: Buffer,
    screenshotData: Buffer
): Promise<{ stateUrl: string; screenshotUrl: string }> {
    const statePath = getSaveStatePath(userId, gameId, slotNumber, 'state');
    const screenshotPath = getSaveStatePath(userId, gameId, slotNumber, 'screenshot');

    // Upload save state binary
    await r2Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: statePath,
        Body: stateData,
        ContentType: 'application/octet-stream',
    }));

    // Upload screenshot
    await r2Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: screenshotPath,
        Body: screenshotData,
        ContentType: 'image/png',
    }));

    // Return URLs (either public or we'll use presigned URLs for access)
    const baseUrl = R2_PUBLIC_URL || `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

    return {
        stateUrl: `${baseUrl}/${statePath}`,
        screenshotUrl: `${baseUrl}/${screenshotPath}`,
    };
}

/**
 * Delete save state files from R2
 */
export async function deleteSaveState(
    userId: string,
    gameId: string,
    slotNumber: number
): Promise<void> {
    const statePath = getSaveStatePath(userId, gameId, slotNumber, 'state');
    const screenshotPath = getSaveStatePath(userId, gameId, slotNumber, 'screenshot');

    await Promise.all([
        r2Client.send(new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: statePath,
        })),
        r2Client.send(new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: screenshotPath,
        })),
    ]);
}

/**
 * Get a presigned URL for downloading save state data
 * Valid for 1 hour
 */
export async function getPresignedStateUrl(
    userId: string,
    gameId: string,
    slotNumber: number
): Promise<string> {
    const statePath = getSaveStatePath(userId, gameId, slotNumber, 'state');

    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: statePath,
    });

    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

/**
 * Get a presigned URL for viewing screenshot
 * Valid for 1 hour
 */
export async function getPresignedScreenshotUrl(
    userId: string,
    gameId: string,
    slotNumber: number
): Promise<string> {
    const screenshotPath = getSaveStatePath(userId, gameId, slotNumber, 'screenshot');

    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: screenshotPath,
    });

    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

export { r2Client, R2_BUCKET_NAME };
