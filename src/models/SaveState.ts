import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISaveState extends Document {
    userId: string;          // Firebase user email
    gameId: string;          // Normalized game identifier (derived from game URL)
    slotNumber: number;      // 1-5 (auto-assigned)
    screenshotUrl: string;   // R2 URL for preview image
    stateUrl: string;        // R2 URL for save state binary data
    core: string;            // Emulator core used (nes, snes, n64, segaCD, psx, dosbox_pure)
    gameName: string;        // Display name for the game
    createdAt: Date;
    updatedAt: Date;
}

const SaveStateSchema = new Schema<ISaveState>(
    {
        userId: { type: String, required: true, index: true },
        gameId: { type: String, required: true, index: true },
        slotNumber: { type: Number, required: true, min: 1, max: 5 },
        screenshotUrl: { type: String, required: true },
        stateUrl: { type: String, required: true },
        core: { type: String, required: true },
        gameName: { type: String, required: true },
    },
    {
        timestamps: true, // Auto-manage createdAt and updatedAt
    }
);

// Composite index for efficient queries: find all saves for a user's game
SaveStateSchema.index({ userId: 1, gameId: 1 });

// Unique constraint: one slot number per user per game
SaveStateSchema.index({ userId: 1, gameId: 1, slotNumber: 1 }, { unique: true });

// Check if model exists before recompiling (Next.js hot reload safe)
const SaveState: Model<ISaveState> =
    mongoose.models.SaveState ||
    mongoose.model<ISaveState>('SaveState', SaveStateSchema);

export default SaveState;
