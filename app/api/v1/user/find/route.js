import dbConnect from "../../../../../lib/mongodb";
import User from "../../../../../model/User";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/v1/user/find:
 *   get:
 *     tags:
 *       - User
 *     summary: Find a user by ID (Admin only)
 *     description: Only admin users can find a user by providing their ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to find
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User found successfully
 *       400:
 *         description: Invalid or missing User ID
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

export async function GET(request) {
    try {
        await dbConnect();
        const url = new URL(request.url, `http://localhost`);
        const id = url.searchParams.get("id");

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

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return new Response(JSON.stringify({
                success: false,
                message: "Invalid or missing User ID"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: "User not found"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            success: true,
            data: user
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "Error finding user",
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
