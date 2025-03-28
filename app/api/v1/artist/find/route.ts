import { NextRequest, NextResponse } from "next/server";
import Artist from "@/model/Artist";
import connectDB from "@/lib/mongodb";

/**
 * @swagger
 * /api/v1/artist/find:
 *   get:
 *     tags:
 *       - Artist
 *     summary: Find an artist by ID
 *     parameters:
 *       - in: query
 *         name: artistId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the artist to find
 *     responses:
 *       200:
 *         description: Artist found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *         description: Bad request (missing artistId)
 *       404:
 *         description: Artist not found
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const artistId = req.nextUrl.searchParams.get("artistId");
        if (!artistId) return NextResponse.json({ message: "Artist ID is required" }, { status: 400 });

        const artist = await Artist.findById(artistId).populate("songs");
        if (!artist) return NextResponse.json({ message: "Artist not found" }, { status: 404 });

        return NextResponse.json({ artist }, { status: 200 });
    } catch (error) {
        console.error("Find Artist Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}