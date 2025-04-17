import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Album from "@/model/Album";
import User from "@/model/User";
import connectDB from "@/lib/mongodb";
import fs from "fs";
import path from "path";

/**
 * @swagger
 * /api/v1/album/add:
 *   post:
 *     tags:
 *       - Album
 *     summary: Add a new album (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Divide"
 *               coverImage:
 *                 type: string
 *                 format: byte
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                 description: "Optional base64-encoded cover image"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Album added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 album:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     coverImage:
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

        const { title, coverImage = null } = await req.json();
        if (!title) {
            return NextResponse.json({ message: "Thiếu tiêu đề" }, { status: 400 });
        }

        const newAlbum = new Album({ title, coverImage: "", songs: [] });
        await newAlbum.save();

        if (coverImage) {
            const base64Data = coverImage.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");
            const imgPath = path.join(process.cwd(), "public", "img", "album", `${newAlbum._id}.jpg`);
            const dirPath = path.dirname(imgPath);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            fs.writeFileSync(imgPath, buffer);
            newAlbum.coverImage = `/img/album/${newAlbum._id}.jpg`;
            await newAlbum.save();
        }

        return NextResponse.json({ message: "Thêm album thành công", album: newAlbum }, { status: 201 });
    } catch (error: any) {
        console.error("Thêm album thất bại:", error);
        return NextResponse.json({ message: "Lỗi máy chủ", error: error.message }, { status: 500 });
    }
}