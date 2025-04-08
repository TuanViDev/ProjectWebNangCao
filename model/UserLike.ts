import mongoose, { type Document, type Model, type Schema } from "mongoose"

interface IUserLike extends Document {
  userId: mongoose.Types.ObjectId
  songId: mongoose.Types.ObjectId
  createdAt: Date
}

const UserLikeSchema: Schema<IUserLike> = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    songId: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
  },
  { timestamps: true },
)

// Create a compound index to ensure a user can only like a song once
UserLikeSchema.index({ userId: 1, songId: 1 }, { unique: true })

const UserLike: Model<IUserLike> = mongoose.models.UserLike || mongoose.model<IUserLike>("UserLike", UserLikeSchema)

export default UserLike
