import mongoose, { Document, Model, Schema } from "mongoose";

interface IArtist extends Document {
    name: string;
    bio?: string;
    profileImage?: string;
}

const ArtistSchema: Schema<IArtist> = new mongoose.Schema(
    {
        name: { type: String, required: true },
        bio: { type: String, required: false, default: "" },
        profileImage: { type: String, required: false, default: "" },
    },
    { timestamps: true }
);

const Artist: Model<IArtist> = mongoose.models.Artist || mongoose.model<IArtist>("Artist", ArtistSchema);

export default Artist;
