import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Song from "@/model/Song";
import User from "@/model/User";
import connectDB from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET;

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
 *                 example: "Ed Sheeran"
 *               album:
 *                 type: string
 *                 example: "Divide"
 *               isVip:
 *                 type: boolean
 *                 default: false
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Song added successfully
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

        const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string };
        const user = await User.findById(decoded.userId);
        if (!user || String(user.role) !== "1") {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { title, artist, album = null, isVip = false } = await req.json();
        if (!title || !artist) {
            return NextResponse.json({ message: "Missing required fields: title and artist" }, { status: 400 });
        }

        const newSong = new Song({ title, artist, album, isVip, listen:0, like:0});
        await newSong.save();

        return NextResponse.json({ message: "Song added successfully", song: newSong }, { status: 201 });
    } catch (error: any) {
        console.error("Add Song Error:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}
