'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SignInRequiredModal from './SignInRequiredModal';
import { extractGameName } from '@/lib/formatTime';

interface GameCardProps {
    title: string;
    image: string;
    hoverImage: string;
    gameUrl: string;
}

export default function GameCard({ title, image, hoverImage, gameUrl }: GameCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [showSignInModal, setShowSignInModal] = useState(false);
    const { user, loading } = useAuth();

    const handleClick = () => {
        // If still loading auth state, wait
        if (loading) return;

        // If not signed in, show the modal
        if (!user) {
            setShowSignInModal(true);
            return;
        }

        // User is signed in, proceed to game
        const encodedUrl = encodeURIComponent(gameUrl);
        window.location.href = `/play?game=${encodedUrl}`;
    };

    const gameName = extractGameName(gameUrl) || title;

    return (
        <>
            <div
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group cursor-pointer relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:border-purple-500/50"
            >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                        src={isHovered && hoverImage ? `/images/${hoverImage}` : `/images/${image}`}
                        alt={title}
                        fill
                        className={`object-cover transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-3 text-center">
                    <h3 className="text-white text-sm font-semibold truncate group-hover:text-cyan-400 transition-colors">
                        {title}
                    </h3>
                </div>
            </div>

            <SignInRequiredModal
                isOpen={showSignInModal}
                onClose={() => setShowSignInModal(false)}
                gameName={gameName}
            />
        </>
    );
}

