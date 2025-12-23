/**
 * Format seconds into a human-readable play time string
 * Examples: "2h 15m", "45m", "5m", "< 1m"
 */
export function formatPlayTime(totalSeconds: number): string {
    if (totalSeconds < 60) {
        return '< 1m';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }

    return `${minutes}m`;
}

/**
 * Format a date into a relative time string
 * Examples: "Just now", "5 minutes ago", "2 hours ago", "Yesterday", "Dec 23"
 */
export function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
        return 'Just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

/**
 * Extract a friendly game name from a game URL
 * Examples: 
 *   "https://r2.example.com/games/Super Mario Bros.nes" -> "Super Mario Bros"
 *   "/games/Zelda.snes" -> "Zelda"
 */
export function extractGameName(gameUrl: string): string {
    // Get the filename from the URL
    const urlPath = gameUrl.split('?')[0]; // Remove query params
    const filename = urlPath.split('/').pop() || gameUrl;

    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^.]+$/, '');

    // Decode URI components and clean up
    return decodeURIComponent(nameWithoutExt).replace(/_/g, ' ');
}
