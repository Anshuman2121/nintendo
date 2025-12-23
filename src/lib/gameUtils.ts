
export interface GameMetadata {
    title: string;
    platform: string;
    slug: string;
    gameUrl: string;
    image: string;
}

const PLATFORM_FILES: Record<string, string> = {
    'nes.csv': 'NES',
    'snes.csv': 'SNES',
    'n64.csv': 'N64',
    'sega.csv': 'SEGA',
    'psx.csv': 'PlayStation',
    'dos.csv': 'DOS'
};

export async function fetchAllGames(): Promise<Map<string, GameMetadata>> {
    const gameMap = new Map<string, GameMetadata>();

    try {
        const promises = Object.entries(PLATFORM_FILES).map(async ([filename, platform]) => {
            try {
                const response = await fetch(`/gameslist/${filename}`);
                if (!response.ok) return;

                const text = await response.text();
                // Parse CSV (imageName, hoverImageName, link)
                const rows = text.split('\n').filter(row => row.trim());

                rows.forEach(row => {
                    const [image, , gameUrl] = row.split(', ').map(s => s.trim());
                    if (!image || !gameUrl) return;

                    // Extract slug from gameUrl
                    // Example: https://.../super-mario-bros.nes -> super-mario-bros
                    const urlPath = gameUrl.split('?')[0];
                    const filename = urlPath.split('/').pop() || gameUrl;
                    const slug = filename.replace(/\.[^.]+$/, '');

                    // Format title from image name (e.g., "Sonic the Hedgehog 2.png" -> "Sonic the Hedgehog 2")
                    // This is more reliable than the URL slug which can be cryptic (e.g., "sa")
                    const title = image.replace(/\.[^.]+$/, '')
                        .replace(/_/g, ' ');

                    gameMap.set(slug, {
                        title,
                        platform,
                        slug,
                        gameUrl,
                        image
                    });
                });
            } catch (err) {
                console.error(`Failed to load ${filename}:`, err);
            }
        });

        await Promise.all(promises);
    } catch (error) {
        console.error('Error fetching game metadata:', error);
    }

    return gameMap;
}
