'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import Emulator from '@/components/Emulator';

export default function LoadPage() {
    const [gameBlob, setGameBlob] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        const url = URL.createObjectURL(file);
        setGameBlob(url);
        setFileName(file.name);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    if (gameBlob) {
        return <Emulator gameUrl={gameBlob} />;
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          relative cursor-pointer w-full max-w-lg aspect-video
          bg-gray-800 rounded-xl border-2 border-dashed
          flex flex-col items-center justify-center gap-4
          transition-all duration-200
          ${isDragging
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-600 hover:border-cyan-500 hover:bg-gray-700'
                    }
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    onChange={handleInputChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".nes,.smc,.sfc,.z64,.n64,.gba,.gb,.gbc,.nds,.smd,.md,.7z,.zip"
                />
                <Upload size={48} className="text-gray-400" />
                <p className="text-gray-400 text-lg font-mono font-bold text-center px-4">
                    Drag ROM file or click here
                </p>
            </div>
        </div>
    );
}
