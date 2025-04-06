// Model Song
import mongoose, { Document, Model, Schema } from "mongoose";

interface ISong extends Document {
    title: string;
    artist: mongoose.Types.ObjectId;
    album?: mongoose.Types.ObjectId;
    isVip?: boolean;
    play: number;
    like: number;
}

const SongSchema: Schema<ISong> = new mongoose.Schema(
    {
        title: { type: String, required: true },
        artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
        album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", default: null },
        isVip: { type: Boolean, default: false },
        play: { type: Number, default: 0 },
        like: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Song: Model<ISong> = mongoose.models.Song || mongoose.model<ISong>("Song", SongSchema);

export default Song;