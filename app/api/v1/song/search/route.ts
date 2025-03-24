import { NextRequest, NextResponse } from "next/server";
import Song from "@/model/Song";
import connectDB from "@/lib/mongodb";
import removeDiacritics from "@/lib/removeDiacritics"; // Giả sử bạn có một hàm để loại bỏ dấu

/**
 * @swagger
 * /api/v1/song/search:
 *   get:
 *     tags:
 *       - Song
 *     summary: Search songs by title, artist, or album
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search term to find in title, artist, or album
 *     responses:
 *       200:
 *         description: Songs found
 *       400:
 *         description: Bad request (missing query)
 *       500:
 *         description: Server error
 */

export async function GET(req: NextRequest) {
    try {
        // Kết nối database
        await connectDB();

        const query = req.nextUrl.searchParams.get("query");
        if (!query) {
            return NextResponse.json({ message: "Query parameter is required" }, { status: 400 });
        }

        // Loại bỏ dấu của từ khóa tìm kiếm
        const normalizedQuery = removeDiacritics(query);

        // Tìm kiếm bài hát với từ khóa đã loại bỏ dấu
        const regexQuery = new RegExp(normalizedQuery, "i"); // 'i' flag để tìm kiếm không phân biệt chữ hoa/thường
        const songs = await Song.find({
            $or: [
                { title: { $regex: regexQuery } },
                { artist: { $regex: regexQuery } },
                { album: { $regex: regexQuery } },
            ],
        });

        if (songs.length === 0) {
            return NextResponse.json({ message: "No songs found" }, { status: 404 });
        }

        return NextResponse.json({ songs }, { status: 200 });
    } catch (error) {
        console.error("Search Songs Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}