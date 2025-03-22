import mongoose, { Document, Model, Schema } from "mongoose";

interface IAlbum extends Document {
    title: string;
    releaseDate: Date;
    coverImage?: string;
    artistIds: mongoose.Types.ObjectId[];
    isVip?: boolean;
}

const AlbumSchema: Schema<IAlbum> = new mongoose.Schema(
    {
        title: { type: String, required: true },
        releaseDate: { type: Date, required: true },
        coverImage: { type: String, required: false, default: "" },
        artistIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true }],
        isVip: { type: Boolean, default: false }, // Chỉ VIP mới nghe được
    },
    { timestamps: true }
);

const Album: Model<IAlbum> = mongoose.models.Album || mongoose.model<IAlbum>("Album", AlbumSchema);

export default Album;
