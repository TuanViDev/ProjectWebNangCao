// api/v1/song/add
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
 *алар

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
 *         multipart/form-data:
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
 *               mp3:
 *                 type: string
 *                 format: binary
 *                 description: "Required MP3 file"
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

        const formData = await req.formData();
        const title = formData.get("title") as string;
        const artist = formData.get("artist") as string;
        const album = formData.get("album") as string || null;
        const isVip = formData.get("isVip") === "true";
        const image = formData.get("image") as string | null;
        const mp3File = formData.get("mp3") as File;

        if (!title || !artist || !mp3File) {
            return NextResponse.json({ message: "Thiếu thông tin bài hát" }, { status: 400 });
        }

        const artistDoc = await Artist.findById(artist);
        if (!artistDoc) return NextResponse.json({ message: "Nghệ sĩ không tồn tại" }, { status: 404 });

        let albumDoc = null;
        if (album) {
            albumDoc = await Album.findById(album);
            if (!albumDoc) return NextResponse.json({ message: "Album không tồn tại" }, { status: 404 });
        }

        const newSong = new Song({ title, artist, album, isVip, play: 0, like: 0 });
        await newSong.save();

        // Save MP3 file
        const mp3Path = path.join(process.cwd(), "public", "mp3", `${newSong._id}.mp3`);
        const mp3Dir = path.dirname(mp3Path);
        if (!fs.existsSync(mp3Dir)) {
            fs.mkdirSync(mp3Dir, { recursive: true });
        }
        const mp3Buffer = Buffer.from(await mp3File.arrayBuffer());
        fs.writeFileSync(mp3Path, mp3Buffer);

        // Save image if provided
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

        // Update Artist
        artistDoc.songs.push(newSong._id as mongoose.Types.ObjectId);
        await artistDoc.save();

        // Update Album if exists
        if (albumDoc) {
            albumDoc.songs.push(newSong._id as mongoose.Types.ObjectId);
            await albumDoc.save();
        }

        return NextResponse.json({ message: "Thêm bài hát thành công", song: newSong }, { status: 201 });
    } catch (error: any) {
        console.error("Thêm bài hát thất bại:", error);
        return NextResponse.json({ message: "Lỗi máy chủ", error: error.message }, { status: 500 });
    }
}