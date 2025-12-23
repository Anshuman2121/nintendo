'use client';

import { useState } from 'react';
import { X, Trash2, Clock, Gamepad2 } from 'lucide-react';

interface SaveStateInfo {
    id: string;
    slotNumber: number;
    screenshotUrl: string;
    gameName: string;
    core: string;
    createdAt: string;
}

interface SaveStateModalProps {
    isOpen: boolean;
    onClose: () => void;
    saves: SaveStateInfo[];
    onLoadState: (saveId: string) => void;
    onDeleteState: (saveId: string) => void;
    isLoading?: boolean;
}

export default function SaveStateModal({
    isOpen,
    onClose,
    saves,
    onLoadState,
    onDeleteState,
    isLoading = false,
}: SaveStateModalProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDelete = async (e: React.MouseEvent, saveId: string) => {
        e.stopPropagation();
        setDeletingId(saveId);
        await onDeleteState(saveId);
        setDeletingId(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-2xl mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <Gamepad2 className="w-6 h-6 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">Load Save State</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                        </div>
                    ) : saves.length === 0 ? (
                        <div className="text-center py-12">
                            <Gamepad2 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-400">No Save States</h3>
                            <p className="text-gray-500 mt-2">
                                Play the game and use the save state button to create your first save.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {saves.map((save) => (
                                <div
                                    key={save.id}
                                    onClick={() => onLoadState(save.id)}
                                    className="group relative bg-gray-800/50 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all hover:scale-[1.02]"
                                >
                                    {/* Screenshot */}
                                    <div className="aspect-video bg-gray-900 relative overflow-hidden">
                                        {/* Fallback icon (shown when image fails or is loading) */}
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-600 z-0">
                                            <Gamepad2 className="w-12 h-12 opacity-30" />
                                        </div>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={save.screenshotUrl}
                                            alt={`Save slot ${save.slotNumber}`}
                                            className="absolute inset-0 w-full h-full object-cover z-10"
                                            onLoad={() => console.log('Screenshot loaded for slot', save.slotNumber)}
                                            onError={(e) => {
                                                console.error('Failed to load screenshot for slot', save.slotNumber, 'URL:', save.screenshotUrl);
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />

                                        {/* Slot Badge */}
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                                            Slot {save.slotNumber}
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDelete(e, save.id)}
                                            disabled={deletingId === save.id}
                                            className="absolute top-2 right-2 p-1.5 bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {deletingId === save.id ? (
                                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : (
                                                <Trash2 className="w-4 h-4 text-white" />
                                            )}
                                        </button>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold text-sm">
                                                Click to Load
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDate(save.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-900/50">
                    <p className="text-xs text-gray-500 text-center">
                        You can store up to 5 save states per game. Oldest saves are removed automatically.
                    </p>
                </div>
            </div>
        </div>
    );
}
