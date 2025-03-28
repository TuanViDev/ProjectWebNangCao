import mongoose, { Document, Model, Schema } from "mongoose";

interface IAlbum extends Document {
    title: string;
    coverImage?: string;
    songs: mongoose.Types.ObjectId[]; // Danh sách ID của các bài hát
}

const AlbumSchema: Schema<IAlbum> = new mongoose.Schema(
    {
        title: { type: String, required: true },
        coverImage: { type: String, required: false, default: "" },
        songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }], // Tham chiếu đến Song
    },
    { timestamps: true }
);

const Album: Model<IAlbum> = mongoose.models.Album || mongoose.model<IAlbum>("Album", AlbumSchema);

export default Album;