import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import User from '@/model/User';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @swagger
 * /api/v1/signin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Đăng nhập tài khoản
 *     description: Xác thực tài khoản, return về JWT.
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
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *                   example: "admin"
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Kiểm tra dữ liệu đầu vào
        if (!email || !password) {
            return NextResponse.json({ message: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });
        }

        await connectDB();

        // Kiểm tra xem email có tồn tại không
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "Email hoặc mật khẩu không hợp lệ" }, { status: 400 });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Email hoặc mật khẩu không hợp lệ" }, { status: 400 });
        }

        // Tạo token JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        return NextResponse.json({ message: "Đăng nhập thành công", token, role: user.role }, { status: 200 });

    } catch (error) {
        console.error("Signin Error:", error);
        return NextResponse.json({ message: "Lỗi máy chủ, vui lòng thử lại sau" }, { status: 500 });
    }
}
