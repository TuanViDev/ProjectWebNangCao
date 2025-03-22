import { NextResponse } from "next/server";
import Song from "@/model/Song";
import connectDB from "@/lib/mongodb";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/v1/song:
 *   get:
 *     tags:
 *       - Song
 *     summary: Get all songs (User must be logged in)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of all songs
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */

export async function GET(request: Request) {
    try {
        await connectDB();

        // Get token from Authorization header
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized: Missing token"
            }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized: Invalid token"
            }, { status: 401 });
        }

        // Get pagination parameters
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");

        const skip = (page - 1) * limit;

        // Fetch songs with pagination
        const songs = await Song.find().skip(skip).limit(limit);

        // Get the total number of songs to calculate pagination
        const total = await Song.countDocuments();

        return NextResponse.json({
            success: true,
            data: songs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Get All Songs Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
