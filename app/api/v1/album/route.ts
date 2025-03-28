import { NextRequest, NextResponse } from "next/server";
import Album from "@/model/Album";
import connectDB from "@/lib/mongodb";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/v1/album:
 *   get:
 *     tags:
 *       - Album
 *     summary: Get paginated albums sorted by newest first (User must be logged in)
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
 *         description: List of paginated albums sorted by newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       coverImage:
 *                         type: string
 *                       songs:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: Array of Song IDs
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized: Missing token",
            }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET as string);

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const albums = await Album.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Album.countDocuments();

        return NextResponse.json({
            success: true,
            data: albums,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }, { status: 200 });
    } catch (error) {
        console.error("Get All Albums Error:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error && error.name === "JsonWebTokenError" ? "Unauthorized: Invalid token" : "Server error",
        }, { status: error instanceof Error && error.name === "JsonWebTokenError" ? 401 : 500 });
    }
}