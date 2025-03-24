import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Album from "@/model/Album";
import User from "@/model/User";
import connectDB from "@/lib/mongodb";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @swagger
 * /api/v1/album/update:
 *   put:
 *     tags:
 *       - Album
 *     summary: Update an existing album (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               albumId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               title:
 *                 type: string
 *                 example: "Divide (Deluxe)"
 *               coverImage:
 *                 type: string
 *                 format: byte
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                 description: "Optional base64-encoded cover image"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Album updated successfully
 *       400:
 *         description: Bad request (missing albumId or invalid data)
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Album not found
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

        const { albumId, title, coverImage } = await req.json();
        if (!albumId) {
            return NextResponse.json({ message: "Missing required field: albumId" }, { status: 400 });
        }

        const album = await Album.findById(albumId);
        if (!album) {
            return NextResponse.json({ message: "Album not found" }, { status: 404 });
        }

        if (title) album.title = title;

        if (coverImage) {
            const base64Data = coverImage.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");
            const imgPath = path.join(process.cwd(), "public", "img", "album", `${album._id}.jpg`);
            const dirPath = path.dirname(imgPath);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            fs.writeFileSync(imgPath, buffer);
            album.coverImage = `/img/album/${album._id}.jpg`;
        }

        await album.save();

        return NextResponse.json({ message: "Album updated successfully", album }, { status: 200 });
    } catch (error: any) {
        console.error("Update Album Error:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}