// api/v1/song/update/route.ts
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
 * /api/v1/song/update:
 *   put:
 *     tags:
 *       - Song
 *     summary: Update an existing song (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               mp3:
 *                 type: string
 *                 format: binary
 *                 description: "Optional MP3 file"
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

        const formData = await req.formData();
        const songId = formData.get("songId") as string;
        const title = formData.get("title") as string;
        const artist = formData.get("artist") as string;
        const album = formData.get("album") as string;
        const isVip = formData.get("isVip") as string;
        const image = formData.get("image") as string;
        const mp3File = formData.get("mp3") as File;

        if (!songId) {
            return NextResponse.json({ message: "Missing required field: songId" }, { status: 400 });
        }

        const song = await Song.findById(songId);
        if (!song) {
            return NextResponse.json({ message: "Song not found" }, { status: 404 });
        }

        // Update artist if changed
        if (artist && artist !== song.artist.toString()) {
            const newArtist = await Artist.findById(artist);
            if (!newArtist) return NextResponse.json({ message: "Artist not found" }, { status: 404 });

            await Artist.updateOne(
                { _id: song.artist },
                { $pull: { songs: new mongoose.Types.ObjectId(songId) } }
            );
            newArtist.songs.push(new mongoose.Types.ObjectId(songId));
            await newArtist.save();
            song.artist = new mongoose.Types.ObjectId(artist);
        }

        // Update album if changed
        if (album !== undefined) {
            const currentAlbumId = song.album?.toString();
            if (currentAlbumId && album !== currentAlbumId) {
                await Album.updateOne(
                    { _id: song.album },
                    { $pull: { songs: new mongoose.Types.ObjectId(songId) } }
                );
            }
            if (album === "" || album === null) {
                song.album = undefined;
            } else if (album && album !== currentAlbumId) {
                const newAlbum = await Album.findById(album);
                if (!newAlbum) return NextResponse.json({ message: "Album not found" }, { status: 404 });
                newAlbum.songs.push(new mongoose.Types.ObjectId(songId));
                await newAlbum.save();
                song.album = new mongoose.Types.ObjectId(album);
            }
        }

        if (title) song.title = title;
        if (isVip !== undefined) song.isVip = isVip === "true";

        // Update MP3 file if provided
        if (mp3File) {
            const mp3Path = path.join(process.cwd(), "public", "mp3", `${song._id}.mp3`);
            const mp3Dir = path.dirname(mp3Path);
            if (!fs.existsSync(mp3Dir)) {
                fs.mkdirSync(mp3Dir, { recursive: true });
            }
            const mp3Buffer = Buffer.from(await mp3File.arrayBuffer());
            fs.writeFileSync(mp3Path, mp3Buffer);
        }

        // Update image if provided
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