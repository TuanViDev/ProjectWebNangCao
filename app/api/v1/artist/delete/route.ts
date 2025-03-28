import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Artist from "@/model/Artist";
import User from "@/model/User";
import Song from "@/model/Song";
import connectDB from "@/lib/mongodb";

/**
 * @swagger
 * /api/v1/artist/delete:
 *   delete:
 *     tags:
 *       - Artist
 *     summary: Delete an artist and related songs (Admin only)
 *     parameters:
 *       - in: query
 *         name: artistId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the artist to delete
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Artist deleted successfully
 *       400:
 *         description: Bad request (missing artistId)
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Artist not found
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

        const artistId = req.nextUrl.searchParams.get("artistId");
        if (!artistId) return NextResponse.json({ message: "Artist ID is required" }, { status: 400 });

        const artist = await Artist.findById(artistId);
        if (!artist) return NextResponse.json({ message: "Artist not found" }, { status: 404 });

        // Xóa tất cả bài hát liên quan
        await Song.deleteMany({ artist: artistId });

        // Xóa artist
        await Artist.findByIdAndDelete(artistId);

        return NextResponse.json({ message: "Artist and related songs deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Delete Artist Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}