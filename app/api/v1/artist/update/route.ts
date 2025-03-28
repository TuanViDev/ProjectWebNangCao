import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Artist from "@/model/Artist";
import User from "@/model/User";
import connectDB from "@/lib/mongodb";
import fs from "fs";
import path from "path";

/**
 * @swagger
 * /api/v1/artist/update:
 *   put:
 *     tags:
 *       - Artist
 *     summary: Update an existing artist (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               artistId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               name:
 *                 type: string
 *                 example: "Ed Sheeran"
 *               bio:
 *                 type: string
 *                 example: "Updated bio..."
 *               profileImage:
 *                 type: string
 *                 format: byte
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                 description: "Optional base64-encoded profile image"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Artist updated successfully
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
 *                         description: Array of Song IDs
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request (missing artistId or invalid data)
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Artist not found
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

        const { artistId, name, bio, profileImage } = await req.json();
        if (!artistId) {
            return NextResponse.json({ message: "Missing required field: artistId" }, { status: 400 });
        }

        const artist = await Artist.findById(artistId);
        if (!artist) {
            return NextResponse.json({ message: "Artist not found" }, { status: 404 });
        }

        if (name) artist.name = name;
        if (bio !== undefined) artist.bio = bio;

        if (profileImage) {
            const base64Data = profileImage.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");
            const imgPath = path.join(process.cwd(), "public", "img", "artist", `${artist._id}.jpg`);
            const dirPath = path.dirname(imgPath);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            fs.writeFileSync(imgPath, buffer);
            artist.profileImage = `/img/artist/${artist._id}.jpg`;
        }

        await artist.save();

        return NextResponse.json({ message: "Artist updated successfully", artist }, { status: 200 });
    } catch (error: any) {
        console.error("Update Artist Error:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}