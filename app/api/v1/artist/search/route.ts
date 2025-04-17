import { NextRequest, NextResponse } from "next/server";
import Artist from "@/model/Artist";
import connectDB from "@/lib/mongodb";

/**
 * @swagger
 * /api/v1/artist/search:
 *   get:
 *     tags:
 *       - Artist
 *     summary: Search artists by name or bio
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search term to find in name or bio
 *     responses:
 *       200:
 *         description: Artists found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 artists:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       bio:
 *                         type: string
 *                       profileImage:
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
 *       400:
 *         description: Bad request (missing query)
 *       404:
 *         description: No artists found
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const query = decodeURIComponent(req.nextUrl.searchParams.get("query") || "");
        if (!query) {
            return NextResponse.json({ message: "Thiếu từ khóa tìm kiếm" }, { status: 400 });
        }

        const artists = await Artist.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { bio: { $regex: query, $options: "i" } },
            ],
        })
            .collation({ locale: "vi", strength: 1 }) // Tìm kiếm không phân biệt dấu
            .populate("songs");

        if (artists.length === 0) {
            return NextResponse.json({ message: "Không tìm thấy nghệ sĩ" }, { status: 404 });
        }

        return NextResponse.json({ artists }, { status: 200 });
    } catch (error) {
        console.error("Tìm kiếm nghệ sĩ thất bại:", error);
        return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
    }
}