import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Song from "@/model/Song";
import User from "@/model/User";
import connectDB from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @swagger
 * /api/v1/song/delete:
 *   delete:
 *     tags:
 *       - Song
 *     summary: Delete a song (Admin only)
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

        const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string };
        const user = await User.findById(decoded.userId);
        if (!user || String(user.role) !== "1") {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }

        const songId = req.nextUrl.searchParams.get("songId");
        if (!songId) return NextResponse.json({ message: "Song ID is required" }, { status: 400 });

        const song = await Song.findByIdAndDelete(songId);
        if (!song) return NextResponse.json({ message: "Song not found" }, { status: 404 });

        return NextResponse.json({ message: "Song deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Delete Song Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
