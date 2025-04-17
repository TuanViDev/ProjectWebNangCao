import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Song from "@/model/Song";
import Artist from "@/model/Artist";
import Album from "@/model/Album";
import User from "@/model/User";
import connectDB from "@/lib/mongodb";

/**
 * @swagger
 * /api/v1/song/delete:
 *   delete:
 *     tags:
 *       - Song
 *     summary: Delete a song and update related artist/album (Admin only)
 *     parameters:
 *       - in: query
 *         name: songId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the song to delete
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Song deleted successfully
 *       400:
 *         description: Bad request (missing songId)
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Song not found
 *       500:
 *         description: Server error
 */
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();

        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        const user = await User.findById(decoded.userId);
        if (!user || String(user.role) !== "1") {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }

        const songId = req.nextUrl.searchParams.get("songId");
        if (!songId) return NextResponse.json({ message: "Thiếu ID bài hát" }, { status: 400 });

        const song = await Song.findById(songId);
        if (!song) return NextResponse.json({ message: "Bài hát không tồn tại" }, { status: 404 });

        // Xóa song khỏi mảng songs trong Artist
        await Artist.updateOne({ _id: song.artist }, { $pull: { songs: songId } });

        // Xóa song khỏi mảng songs trong Album nếu có
        if (song.album) {
            await Album.updateOne({ _id: song.album }, { $pull: { songs: songId } });
        }

        // Xóa song
        await Song.findByIdAndDelete(songId);

        return NextResponse.json({ message: "Xóa bài hát thành công" }, { status: 200 });
    } catch (error) {
        console.error("Xóa bài hát thất bại:", error);
        return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
    }
}