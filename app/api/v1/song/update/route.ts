import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Song from "@/model/Song";
import Artist from "@/model/Artist";
import Album from "@/model/Album";
import User from "@/model/User";
import connectDB from "@/lib/mongodb";
import fs from "fs";
import path from "path";

/**
 * @swagger
 * /api/v1/song/update:
 *   put:
 *     tags:
 *       - Song
 *     summary: Update an existing song (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               songId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               title:
 *                 type: string
 *                 example: "Shape of You"
 *               artist:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *                 description: Artist ID (ObjectId)
 *               album:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *                 description: Album ID (ObjectId, optional)
 *               isVip:
 *                 type: boolean
 *                 default: false
 *               image:
 *                 type: string
 *                 format: byte
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                 description: "Optional base64-encoded image"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Song updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *         description: Bad request (missing songId or invalid data)
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Song not found
 *       500:
 *         description: Server error
 */
export async function PUT(req: NextRequest) {
    try {
        await connectDB();

        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        const user = await User.findById(decoded.userId);
        if (!user || String(user.role) !== "1") {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { songId, title, artist, album, isVip, image } = await req.json();
        if (!songId) {
            return NextResponse.json({ message: "Missing required field: songId" }, { status: 400 });
        }

        const song = await Song.findById(songId);
        if (!song) {
            return NextResponse.json({ message: "Song not found" }, { status: 404 });
        }

        // Cập nhật artist nếu thay đổi
        if (artist && artist !== song.artist.toString()) {
            const newArtist = await Artist.findById(artist);
            if (!newArtist) return NextResponse.json({ message: "Artist not found" }, { status: 404 });

            // Xóa song khỏi artist cũ
            await Artist.updateOne({ _id: song.artist }, { $pull: { songs: songId } });
            // Thêm song vào artist mới
            newArtist.songs.push(songId);
            await newArtist.save();
            song.artist = artist;
        }

        // Cập nhật album nếu thay đổi
        if (album !== undefined && album !== song.album?.toString()) {
            if (song.album) {
                // Xóa song khỏi album cũ
                await Album.updateOne({ _id: song.album }, { $pull: { songs: songId } });
            }
            if (album) {
                const newAlbum = await Album.findById(album);
                if (!newAlbum) return NextResponse.json({ message: "Album not found" }, { status: 404 });
                newAlbum.songs.push(songId);
                await newAlbum.save();
            }
            song.album = album || null;
        }

        if (title) song.title = title;
        if (isVip !== undefined) song.isVip = isVip;

        if (image) {
            const base64Data = image.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");
            const imgPath = path.join(process.cwd(), "public", "img", "song", `${song._id}.jpg`);
            const dirPath = path.dirname(imgPath);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            fs.writeFileSync(imgPath, buffer);
        }

        await song.save();

        return NextResponse.json({ message: "Song updated successfully", song }, { status: 200 });
    } catch (error: any) {
        console.error("Update Song Error:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}