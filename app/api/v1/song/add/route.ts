import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Song from "@/model/Song";
import Artist from "@/model/Artist";
import Album from "@/model/Album";
import User from "@/model/User";
import connectDB from "@/lib/mongodb";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/v1/song/add:
 *   post:
 *     tags:
 *       - Song
 *     summary: Add a new song (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *       201:
 *         description: Song added successfully
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
 *         description: Bad request (missing fields)
 *       403:
 *         description: Forbidden (Admin only)
 *       500:
 *         description: Server error
 */
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        const user = await User.findById(decoded.userId);
        if (!user || String(user.role) !== "1") {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { title, artist, album = null, isVip = false, image = null } = await req.json();
        if (!title || !artist) {
            return NextResponse.json({ message: "Missing required fields: title and artist" }, { status: 400 });
        }

        // Kiểm tra artist có tồn tại không
        const artistDoc = await Artist.findById(artist);
        if (!artistDoc) return NextResponse.json({ message: "Artist not found" }, { status: 404 });

        // Kiểm tra album nếu có
        let albumDoc = null;
        if (album) {
            albumDoc = await Album.findById(album);
            if (!albumDoc) return NextResponse.json({ message: "Album not found" }, { status: 404 });
        }

        const newSong = new Song({ title, artist, album, isVip, play: 0, like: 0 });
        await newSong.save();

        // Cập nhật mảng songs trong Artist
        artistDoc.songs.push(newSong._id as mongoose.Types.ObjectId);
        await artistDoc.save();

        // Cập nhật mảng songs trong Album nếu có
        if (albumDoc) {
            albumDoc.songs.push(newSong._id as mongoose.Types.ObjectId);
            await albumDoc.save();
        }

        if (image) {
            const base64Data = image.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");
            const imgPath = path.join(process.cwd(), "public", "img", "song", `${newSong._id}.jpg`);
            const dirPath = path.dirname(imgPath);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            fs.writeFileSync(imgPath, buffer);
        }

        return NextResponse.json({ message: "Song added successfully", song: newSong }, { status: 201 });
    } catch (error: any) {
        console.error("Add Song Error:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}