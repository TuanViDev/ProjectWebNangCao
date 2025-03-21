import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import User from '@/model/User';
import connectDB from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const { email, password, confirmPassword } = await request.json();

        // Kiểm tra dữ liệu đầu vào
        if (!email || !password || !confirmPassword) {
            return NextResponse.json({ message: "Please fill in all fields" }, { status: 400 });
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
        }

        await connectDB();

        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 12);

        // Tạo người dùng mới
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });

    } catch (error) {
        console.error("Signup Error:", error);
        return NextResponse.json({ message: "Server error, please try again" }, { status: 500 });
    }
}
