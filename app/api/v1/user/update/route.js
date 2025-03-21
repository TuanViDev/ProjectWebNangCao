import dbConnect from "../../../../../config/connection";
import User from "../../../../../model/User";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/v1/user/update:
 *   put:
 *     tags:
 *       - User
 *     description: Update a user by ID
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

export async function PUT(request) {
    try {
        await dbConnect();
        const url = new URL(request.url, `http://localhost`);
        const id = url.searchParams.get("id");
        const body = await request.json();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return new Response(JSON.stringify({
                success: false,
                message: "Invalid or missing User ID"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Kiểm tra nếu phone không phải là string
        if (body.phone && typeof body.phone !== "string") {
            return new Response(JSON.stringify({
                success: false,
                message: "Phone must be a string"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updatedUser = await User.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true
        });

        if (!updatedUser) {
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
            message: "User updated successfully",
            data: updatedUser
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "Error updating user",
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
