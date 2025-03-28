import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Album from "@/model/Album";
import Song from "@/model/Song";
import User from "@/model/User";
import connectDB from "@/lib/mongodb";

/**
 * @swagger
 * /api/v1/album/delete:
 *   delete:
 *     tags:
 *       - Album
 *     summary: Delete an album and update related songs (Admin only)
 *     parameters:
 *       - in: query
 *         name: albumId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the album to delete
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Album deleted successfully
 *       400:
 *         description: Bad request (missing albumId)
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Album not found
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

        const albumId = req.nextUrl.searchParams.get("albumId");
        if (!albumId) return NextResponse.json({ message: "Album ID is required" }, { status: 400 });

        const album = await Album.findById(albumId);
        if (!album) return NextResponse.json({ message: "Album not found" }, { status: 404 });

        // Cập nhật các bài hát liên quan (xóa tham chiếu album)
        await Song.updateMany({ album: albumId }, { $unset: { album: "" } });

        // Xóa album
        await Album.findByIdAndDelete(albumId);

        return NextResponse.json({ message: "Album deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Delete Album Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}