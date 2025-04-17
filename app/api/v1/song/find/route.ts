import { NextRequest, NextResponse } from "next/server";
import Song from "@/model/Song";
import connectDB from "@/lib/mongodb";

/**
 * @swagger
 * /api/v1/song/find:
 *   get:
 *     tags:
 *       - Song
 *     summary: Find a song by ID
 *     parameters:
 *       - in: query
 *         name: songId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the song to find
 *     responses:
 *       200:
 *         description: Song found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 song:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     artist:
 *                       type: string
 *                       description: Artist ID (ObjectId)
 *                     album:
 *                       type: string
 *                       description: Album ID (ObjectId, nullable)
 *                     isVip:
 *                       type: boolean
 *                     play:
 *                       type: integer
 *                     like:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request (missing songId)
 *       404:
 *         description: Song not found
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const songId = req.nextUrl.searchParams.get("songId");
        if (!songId) return NextResponse.json({ message: "Thiếu ID bài hát" }, { status: 400 });

        const song = await Song.findById(songId)
            .populate("artist", "name")
            .populate("album", "title");
        if (!song) return NextResponse.json({ message: "Bài hát không tồn tại" }, { status: 404 });

        return NextResponse.json({ song }, { status: 200 });
    } catch (error) {
        console.error("Truy vấn thất bại:", error);
        return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
    }
}