'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import GameCard from './GameCard';

interface GameSectionProps {
    title: string;
    csvFile: string;
    id: string;
}

interface GameData {
    image: string;
    hoverImage: string;
    gameUrl: string;
}

export default function GameSection({ title, csvFile, id }: GameSectionProps) {
    const [games, setGames] = useState<GameData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGames = async () => {
            try {
                const response = await fetch(`/gameslist/${csvFile}`);
                const text = await response.text();

                // Parse CSV manually (format: imageName, hoverImageName, link)
                const rows = text.split('\n').filter(row => row.trim());
                const parsedGames: GameData[] = rows.map(row => {
                    const [image, hoverImage, gameUrl] = row.split(', ').map(s => s.trim());
                    return { image, hoverImage, gameUrl };
                });

                setGames(parsedGames);
            } catch (error) {
                console.error(`Error loading ${csvFile}:`, error);
            } finally {
                setLoading(false);
            }
        };

        loadGames();
    }, [csvFile]);

    return (
        <section id={id} className="py-8">
            {/* Section Header */}
            <div className="flex justify-center items-center mb-6 bg-gray-600/80 backdrop-blur-sm rounded-lg p-4 mx-4">
                <h2 className="text-2xl md:text-3xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(0,255,65,0.5)]">
                    {title}
                </h2>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4">
                {loading ? (
                    // Loading skeletons
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white/10 rounded-xl aspect-[3/4]" />
                    ))
                ) : (
                    games.map((game, index) => (
                        <GameCard
                            key={`${game.image}-${index}`}
                            title={game.image.split('.')[0]}
                            image={game.image}
                            hoverImage={game.hoverImage}
                            gameUrl={game.gameUrl}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
