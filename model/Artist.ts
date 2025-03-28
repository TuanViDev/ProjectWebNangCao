import mongoose, { Document, Model, Schema } from "mongoose";

interface IArtist extends Document {
    name: string;
    bio?: string;
    profileImage?: string;
    songs: mongoose.Types.ObjectId[]; // Danh sách ID của các bài hát
}

const ArtistSchema: Schema<IArtist> = new mongoose.Schema(
    {
        name: { type: String, required: true },
        bio: { type: String, required: false, default: "" },
        profileImage: { type: String, required: false, default: "" },
        songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }], // Tham chiếu đến Song
    },
    { timestamps: true }
);

const Artist: Model<IArtist> = mongoose.models.Artist || mongoose.model<IArtist>("Artist", ArtistSchema);

export default Artist;