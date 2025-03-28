import mongoose, { Document, Model, Schema } from "mongoose";

interface ISong extends Document {
    title: string;
    artist: mongoose.Types.ObjectId; // Tham chiếu đến Artist
    album?: mongoose.Types.ObjectId; // Tham chiếu đến Album (tùy chọn)
    isVip?: boolean;
    play: number; // Lượt nghe
    like: number; // Lượt thích
}

const SongSchema: Schema<ISong> = new mongoose.Schema(
    {
        title: { type: String, required: true },
        artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true }, // Tham chiếu đến Artist
        album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", default: null }, // Tham chiếu đến Album
        isVip: { type: Boolean, default: false },
        play: { type: Number, default: 0 }, // Mặc định 0 lượt nghe
        like: { type: Number, default: 0 }, // Mặc định 0 lượt thích
    },
    { timestamps: true }
);

const Song: Model<ISong> = mongoose.models.Song || mongoose.model<ISong>("Song", SongSchema);

export default Song;