import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import User from '@/model/User';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = "ABC";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Kiểm tra dữ liệu đầu vào
        if (!email || !password) {
            return NextResponse.json({ message: "Please fill in all fields" }, { status: 400 });
        }

        await connectDB();

        // Kiểm tra xem email có tồn tại không
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }

        // Tạo token JWT
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        return NextResponse.json({ message: "Login successful", token }, { status: 200 });

    } catch (error) {
        console.error("Signin Error:", error);
        return NextResponse.json({ message: "Server error, please try again" }, { status: 500 });
    }
}
