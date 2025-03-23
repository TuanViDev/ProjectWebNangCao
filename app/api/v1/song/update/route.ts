import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Song from "@/model/Song";
import User from "@/model/User";
import connectDB from "@/lib/mongodb";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET;

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
 *                 example: "Ed Sheeran"
 *               album:
 *                 type: string
 *                 example: "Divide"
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

        const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string };
        const user = await User.findById(decoded.userId);
        if (!user || String(user.role) !== "1") {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { songId, title, artist, album, isVip, image } = await req.json();
        
        if (!songId) {
            return NextResponse.json({ message: "Missing required field: songId" }, { status: 400 });
        }

        // Find the existing song
        const song = await Song.findById(songId);
        if (!song) {
            return NextResponse.json({ message: "Song not found" }, { status: 404 });
        }

        // Update song fields if provided
        if (title) song.title = title;
        if (artist) song.artist = artist;
        if (album !== undefined) song.album = album; // Allow null/undefined to clear album
        if (isVip !== undefined) song.isVip = isVip;

        // Handle image update if provided
        if (image) {
            const base64Data = image.split(",")[1]; // Strip off the 'data:image/jpeg;base64,' part if present
            const buffer = Buffer.from(base64Data, "base64");

            const imgPath = path.join(process.cwd(), "public", "img", "song", `${song._id}.jpg`);
            
            // Ensure the directory exists
            const dirPath = path.dirname(imgPath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Write the new image file to the server (overwrites existing if present)
            fs.writeFileSync(imgPath, buffer);
        }

        await song.save();

        return NextResponse.json({ message: "Song updated successfully", song }, { status: 200 });
    } catch (error: any) {
        console.error("Update Song Error:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}