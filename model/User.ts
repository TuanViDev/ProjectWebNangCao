import mongoose, { Document, Model, Schema } from "mongoose";

interface IUser extends Document {
    username?: string;
    password: string;
    phone?: string;
    email: string;
    role?: string;
    vip?: {
        expireAt: Date | null;
    };
}

// Định nghĩa Schema với các giá trị mặc định
const UserSchema: Schema<IUser> = new mongoose.Schema(
    {
        username: { type: String, required: false, default: "" },
        password: { type: String, required: true },
        phone: { type: String, required: false, default: "" },
        email: { type: String, required: true, unique: true },
        role: { type: String, required: false, default: "0" }, // 0 = user, 1 = admin
        vip: {
            expireAt: { type: Date, required: false, default: null }, // Ngày hết hạn hoặc null
        }
    },
    { timestamps: true }
);

// Đảm bảo không tạo lại model nếu đã tồn tại
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
