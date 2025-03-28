import dbConnect from "../../../../lib/mongodb";
import User from "../../../../model/User";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     tags:
 *       - User
 *     summary: Get a list of users (Admin only)
 *     description: Only admin users can retrieve the list of users.
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal Server Error
 */

export async function GET(request) {
    try {
        await dbConnect();
        
        // Lấy token từ header
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(JSON.stringify({
                success: false,
                message: "Unauthorized: Missing token"
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                message: "Unauthorized: Invalid token"
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Kiểm tra quyền admin dựa trên email từ token
        const adminUser = await User.findOne({ email: decoded.email });
        if (!adminUser || adminUser.role !== "1") {
            return new Response(JSON.stringify({
                success: false,
                message: "Forbidden: Admin access required"
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Lấy query parameters từ request
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get("page")) || 1;
        const limit = parseInt(url.searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        // Lấy danh sách người dùng từ MongoDB
        const users = await User.find().skip(skip).limit(limit);
        const total = await User.countDocuments();

        return new Response(JSON.stringify({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "Lỗi khi lấy danh sách người dùng",
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}