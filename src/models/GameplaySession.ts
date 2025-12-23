
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGameplaySession extends Document {
    email: string;
    game_name: string;
    total_time_seconds: number;
    last_played: Date;
    created_at: Date;
}

const GameplaySessionSchema = new Schema<IGameplaySession>({
    email: { type: String, required: true, index: true },
    game_name: { type: String, required: true },
    total_time_seconds: { type: Number, default: 0 },
    last_played: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now }
});

// Composite index for unique sessions per user per game
GameplaySessionSchema.index({ email: 1, game_name: 1 }, { unique: true });

// Check if model exists before recompiling (Next.js hot reload safe)
const GameplaySession: Model<IGameplaySession> =
    mongoose.models.GameplaySession ||
    mongoose.model<IGameplaySession>('GameplaySession', GameplaySessionSchema);

export default GameplaySession;
