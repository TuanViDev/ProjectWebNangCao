import { NextRequest, NextResponse } from "next/server";
import Album from "@/model/Album";
import connectDB from "@/lib/mongodb";

/**
 * @swagger
 * /api/v1/album/search:
 *   get:
 *     tags:
 *       - Album
 *     summary: Search albums by title
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search term to find in title
 *     responses:
 *       200:
 *         description: Albums found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 albums:
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
 *       400:
 *         description: Bad request (missing query)
 *       404:
 *         description: No albums found
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const query = decodeURIComponent(req.nextUrl.searchParams.get("query") || "");
        if (!query) {
            return NextResponse.json({ message: "Query parameter is required" }, { status: 400 });
        }

        const albums = await Album.find({
            title: { $regex: query, $options: "i" },
        })
            .collation({ locale: "vi", strength: 1 }) // Tìm kiếm không phân biệt dấu
            .populate("songs");

        if (albums.length === 0) {
            return NextResponse.json({ message: "No albums found" }, { status: 404 });
        }

        return NextResponse.json({ albums }, { status: 200 });
    } catch (error) {
        console.error("Search Albums Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}