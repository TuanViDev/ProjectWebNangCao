import { NextRequest, NextResponse } from "next/server";
import Song from "@/model/Song";
import connectDB from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { SortOrder } from "mongoose";

/**
 * @swagger
 * /api/v1/song/show:
 *   get:
 *     tags:
 *       - Song
 *     summary: Get songs based on specific criteria (User must be logged in)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: param
 *         in: query
 *         description: Criteria to sort songs (newest, most-liked, most-played)
 *         required: true
 *         schema:
 *           type: string
 *           enum: [newest, most-liked, most-played]
 *       - name: limit
 *         in: query
 *         description: Number of songs to return
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of songs based on specified criteria
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
 *                       artist:
 *                         type: string
 *                       album:
 *                         type: string
 *                       isVip:
 *                         type: boolean
 *                       play:
 *                         type: integer
 *                       like:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *       400:
 *         description: Bad request - Missing or invalid parameters
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Xác thực token
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized: Missing token",
            }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET as string);

        // Lấy query parameters
        const url = new URL(req.url);
        const param = url.searchParams.get("param");
        const limit = url.searchParams.get("limit"); // Không set giá trị mặc định

        // Kiểm tra param hợp lệ
        const validParams = ["newest", "most-liked", "most-played"];
        if (!param || !validParams.includes(param)) {
            return NextResponse.json({
                success: false,
                message: "Invalid or missing 'param'. Must be 'newest', 'most-liked', or 'most-played'",
            }, { status: 400 });
        }

        // Kiểm tra limit bắt buộc
        if (!limit) {
            return NextResponse.json({
                success: false,
                message: "Missing 'limit' parameter. Please provide a valid number",
            }, { status: 400 });
        }

        const limitNumber = parseInt(limit);
        if (isNaN(limitNumber) || limitNumber <= 0) {
            return NextResponse.json({
                success: false,
                message: "'limit' must be a positive number",
            }, { status: 400 });
        }

        // Xác định cách sắp xếp dựa trên param
        let sortOption: { [key: string]: SortOrder } = {};
        switch (param) {
            case "newest":
                sortOption = { createdAt: -1 };
                break;
            case "most-liked":
                sortOption = { like: -1 };
                break;
            case "most-played":
                sortOption = { play: -1 };
                break;
        }

        // Truy vấn database
        const songs = await Song.find()
            .sort(sortOption)
            .limit(limitNumber)
            .populate("artist", "name")
            .populate("album", "title");

        const total = await Song.countDocuments();

        return NextResponse.json({
            success: true,
            data: songs,
            total: total,
        }, { status: 200 });

    } catch (error) {
        console.error("Get Songs Error:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error && error.name === "JsonWebTokenError" 
                ? "Unauthorized: Invalid token" 
                : "Server error",
        }, { 
            status: error instanceof Error && error.name === "JsonWebTokenError" ? 401 : 500 
        });
    }
}