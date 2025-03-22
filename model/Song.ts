import mongoose, { Document, Model, Schema } from "mongoose";

interface ISong extends Document {
    title: string;
    artist: string;
    album?: string;
    isVip?: boolean;
    play: number; // Lượt nghe
    like: number; // Lượt thích
}

const SongSchema: Schema<ISong> = new mongoose.Schema(
    {
        title: { type: String, required: true },
        artist: { type: String, required: true },
        album: { type: String, default: null },
        isVip: { type: Boolean, default: false },
        play: { type: Number, default: 0 }, // Mặc định 0 lượt nghe
        like: { type: Number, default: 0 }, // Mặc định 0 lượt thích
    },
    { timestamps: true }
);

const Song: Model<ISong> = mongoose.models.Song || mongoose.model<ISong>("Song", SongSchema);

export default Song;
