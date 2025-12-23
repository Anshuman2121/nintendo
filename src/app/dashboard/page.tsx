'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { formatPlayTime, formatRelativeTime } from '@/lib/formatTime';
import { fetchAllGames, GameMetadata } from '@/lib/gameUtils';
import { Gamepad2, Clock, Calendar, Trophy, ArrowLeft, Loader2, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface GameSession {
    email: string;
    game_name: string;
    total_time_seconds: number;
    last_played: string;
    created_at: string;
}

interface StatsResponse {
    success: boolean;
    email: string;
    totalPlayTime: number;
    gamesPlayed: number;
    sessions: GameSession[];
    message?: string;
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [gameMetadata, setGameMetadata] = useState<Map<string, GameMetadata>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect to home if not signed in
        if (!authLoading && !user) {
            router.push('/');
            return;
        }

        // Fetch stats and game metadata when user is available
        if (user?.email) {
            const loadData = async () => {
                try {
                    setLoading(true);

                    // Parallel fetch: stats and game metadata
                    const [statsRes, gamesMap] = await Promise.all([
                        fetch(`/api/stats/${encodeURIComponent(user.email!)}`),
                        fetchAllGames()
                    ]);

                    if (!statsRes.ok) throw new Error('Failed to fetch stats');

                    const statsData = await statsRes.json();
                    setStats(statsData);
                    setGameMetadata(gamesMap);
                } catch (err) {
                    console.error('Error loading dashboard data:', err);
                    setError('Failed to load your gaming statistics');
                } finally {
                    setLoading(false);
                }
            };

            loadData();
        }
    }, [user, authLoading, router]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        );
    }

    // User should be signed in at this point
    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12 px-4">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Back button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Games</span>
                </Link>

                {/* Header with user info */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
                    {user.photoURL ? (
                        <Image
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            width={80}
                            height={80}
                            className="rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                            unoptimized
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                            <Gamepad2 className="w-10 h-10 text-white" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                            {user.displayName || 'Gamer'}&apos;s Dashboard
                        </h1>
                        <p className="text-gray-400">{user.email}</p>
                    </div>
                </div>

                {/* Stats Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Total Play Time */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                <Clock className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Play Time</p>
                                <p className="text-2xl font-bold text-white">
                                    {loading ? '...' : formatPlayTime(stats?.totalPlayTime || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Games Played */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Gamepad2 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Games Played</p>
                                <p className="text-2xl font-bold text-white">
                                    {loading ? '...' : stats?.gamesPlayed || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Most Recent */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Last Played</p>
                                <p className="text-2xl font-bold text-white">
                                    {loading ? '...' :
                                        stats?.sessions?.[0]?.last_played
                                            ? formatRelativeTime(stats.sessions[0].last_played)
                                            : 'Never'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Games List */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            Your Gaming History
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Loading your stats...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <p className="text-red-400">{error}</p>
                        </div>
                    ) : stats?.sessions && stats.sessions.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {stats.sessions.map((session, index) => {
                                const details = gameMetadata.get(session.game_name);
                                const displayName = details?.title || session.game_name;
                                const platform = details?.platform || 'Unknown';
                                const playUrl = details ? `/play?game=${details.gameUrl}` : null;

                                return (
                                    <div
                                        key={`${session.game_name}-${index}`}
                                        className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Game icon */}
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                                                <Gamepad2 className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-white">
                                                        {displayName}
                                                    </h3>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                                                        {platform}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400">
                                                    Last played: {formatRelativeTime(session.last_played)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-400">Time Played</p>
                                                <p className="font-bold text-cyan-400">
                                                    {formatPlayTime(session.total_time_seconds)}
                                                </p>
                                            </div>

                                            {playUrl && (
                                                <Link
                                                    href={playUrl}
                                                    className="p-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:scale-110 transition-all border border-green-500/30"
                                                    title="Play Again"
                                                >
                                                    <Play size={20} fill="currentColor" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No games played yet</h3>
                            <p className="text-gray-400 mb-6">
                                Start playing some games and your stats will appear here!
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300"
                            >
                                <Gamepad2 size={20} />
                                Browse Games
                            </Link>
                        </div>
                    )}
                </div>

                {/* Dev mode notice */}
                {stats?.message && (
                    <p className="mt-4 text-center text-gray-500 text-sm">
                        {stats.message}
                    </p>
                )}
            </div>
        </div>
    );
}

