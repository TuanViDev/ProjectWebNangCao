import mongoose, { Document, Model, Schema } from "mongoose";

interface IAlbum extends Document {
    title: string;
    coverImage?: string;
}

const AlbumSchema: Schema<IAlbum> = new mongoose.Schema(
    {
        title: { type: String, required: true },
        coverImage: { type: String, required: false, default: "" },
    },
    { timestamps: true }
);

const Album: Model<IAlbum> = mongoose.models.Album || mongoose.model<IAlbum>("Album", AlbumSchema);

export default Album;