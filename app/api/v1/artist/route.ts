import { NextRequest, NextResponse } from "next/server";
import Artist from "@/model/Artist";
import connectDB from "@/lib/mongodb";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/v1/artist:
 *   get:
 *     tags:
 *       - Artist
 *     summary: Get paginated artists sorted by newest first (User must be logged in)
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
 *         description: List of paginated artists sorted by newest first
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get token from Authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized: Missing token",
            }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized: Invalid token",
            }, { status: 401 });
        }

        // Get pagination parameters
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Fetch paginated artists sorted by newest first based on _id
        const artists = await Artist.find()
            .sort({ _id: -1 }) // Sắp xếp theo _id giảm dần (mới nhất trước)
            .skip(skip)
            .limit(limit);
        const total = await Artist.countDocuments();

        return NextResponse.json({
            success: true,
            data: artists,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }, { status: 200 });
    } catch (error) {
        console.error("Get All Artists Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}