import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Artist from "@/model/Artist";
import User from "@/model/User";
import connectDB from "@/lib/mongodb";
import fs from "fs";
import path from "path";

/**
 * @swagger
 * /api/v1/artist/add:
 *   post:
 *     tags:
 *       - Artist
 *     summary: Add a new artist (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ed Sheeran"
 *               bio:
 *                 type: string
 *                 example: "English singer-songwriter..."
 *               profileImage:
 *                 type: string
 *                 format: byte
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                 description: "Optional base64-encoded profile image"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Artist added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 artist:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *                     songs:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: Array of Song IDs (empty by default)
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

        const { name, bio = "", profileImage = null } = await req.json();
        if (!name) {
            return NextResponse.json({ message: "Missing required field: name" }, { status: 400 });
        }

        const newArtist = new Artist({ name, bio, profileImage: "", songs: [] });
        await newArtist.save();

        if (profileImage) {
            const base64Data = profileImage.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");
            const imgPath = path.join(process.cwd(), "public", "img", "artist", `${newArtist._id}.jpg`);
            const dirPath = path.dirname(imgPath);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            fs.writeFileSync(imgPath, buffer);
            newArtist.profileImage = `/img/artist/${newArtist._id}.jpg`;
            await newArtist.save();
        }

        return NextResponse.json({ message: "Artist added successfully", artist: newArtist }, { status: 201 });
    } catch (error: any) {
        console.error("Add Artist Error:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}