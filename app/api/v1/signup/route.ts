import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import User from '@/model/User';
import connectDB from '@/lib/mongodb';

/**
 * @swagger
 * /api/v1/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User Sign Up
 *     description: Register a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: "password123"
 *               confirmPassword:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request (e.g., invalid email, password mismatch, user already exists)
 *       500:
 *         description: Server error
 */
export async function POST(request: Request) {
    try {
        const { email, password, confirmPassword } = await request.json();

        // Kiểm tra dữ liệu đầu vào
        if (!email || !password || !confirmPassword) {
            return NextResponse.json({ message: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ message: "Email sai định dạng" }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ message: "Nhập lại mật khẩu không trùng khớp" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ message: "Mật khẩu phải có ít nhất 6 kí tự" }, { status: 400 });
        }

        await connectDB();

        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "Email này đã tồn tại trên hệ thống" }, { status: 400 });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 12);

        // Tạo người dùng mới
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        return NextResponse.json({ message: "Đăng ký thành công" }, { status: 201 });

    } catch (error) {
        console.error("Đăng ký thất bại:", error);
        return NextResponse.json({ message: "Lỗi máy chủ, vui lòng thử lại sau" }, { status: 500 });
    }
}
