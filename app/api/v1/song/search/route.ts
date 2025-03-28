import { NextRequest, NextResponse } from "next/server";
import Song from "@/model/Song";
import connectDB from "@/lib/mongodb";
import removeDiacritics from "@/lib/removeDiacritics";

/**
 * @swagger
 * /api/v1/song/search:
 *   get:
 *     tags:
 *       - Song
 *     summary: Search songs by title
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search term to find in title
 *     responses:
 *       200:
 *         description: Songs found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 songs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       artist:
 *                         type: string
 *                         description: Artist ID (ObjectId)
 *                       album:
 *                         type: string
 *                         description: Album ID (ObjectId, nullable)
 *                       isVip:
 *                         type: boolean
 *                       play:
 *                         type: integer
 *                       like:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request (missing query)
 *       404:
 *         description: No songs found
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const query = req.nextUrl.searchParams.get("query");
        if (!query) {
            return NextResponse.json({ message: "Query parameter is required" }, { status: 400 });
        }

        const normalizedQuery = removeDiacritics(query);
        const regexQuery = new RegExp(normalizedQuery, "i");
        const songs = await Song.find({
            title: { $regex: regexQuery },
        })
            .populate("artist", "name")
            .populate("album", "title");

        if (songs.length === 0) {
            return NextResponse.json({ message: "No songs found" }, { status: 404 });
        }

        return NextResponse.json({ songs }, { status: 200 });
    } catch (error) {
        console.error("Search Songs Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}