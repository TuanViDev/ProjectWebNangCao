import dbConnect from "../../../../../config/connection";
import User from "../../../../../model/User";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/v1/user/delete:
 *   delete:
 *     tags:
 *       - User
 *     description: Delete a user by ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

export async function DELETE(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id } = body;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return new Response(JSON.stringify({
                success: false,
                message: "Invalid or missing User ID"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
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
            message: "User deleted successfully"
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "Error deleting user",
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
