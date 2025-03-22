import mongoose, { Document, Model, Schema } from "mongoose";

interface ISong extends Document {
    title: string;
    duration: number; // Độ dài bài hát tính bằng giây
    albumId: mongoose.Types.ObjectId;
    artistIds: mongoose.Types.ObjectId[];
    audioUrl: string;
    isVip?: boolean;
}

const SongSchema: Schema<ISong> = new mongoose.Schema(
    {
        title: { type: String, required: true },
        duration: { type: Number, required: true },
        albumId: { type: mongoose.Schema.Types.ObjectId, ref: "Album", required: true },
        artistIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true }],
        audioUrl: { type: String, required: true },
        isVip: { type: Boolean, default: false }, // Chỉ VIP mới nghe được
    },
    { timestamps: true }
);

const Song: Model<ISong> = mongoose.models.Song || mongoose.model<ISong>("Song", SongSchema);

export default Song;
