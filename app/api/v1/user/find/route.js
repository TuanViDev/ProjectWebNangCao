import dbConnect from "../../../../../config/connection";
import User from "../../../../../model/User";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/v1/user/find:
 *   get:
 *     tags:
 *       - User
 *     description: Find a user by ID
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to find
 *     responses:
 *       200:
 *         description: User found successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

export async function GET(request) {
    try {
        await dbConnect();
        const url = new URL(request.url, `http://localhost`); // Đảm bảo lấy URL chính xác
        const id = url.searchParams.get("id");

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
