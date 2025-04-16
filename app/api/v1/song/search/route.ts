import { type NextRequest, NextResponse } from "next/server"
import Song from "@/model/Song"
import connectDB from "@/lib/mongodb"

/**
 * @swagger
 * /api/v1/song/search:
 *   get:
 *     tags:
 *       - Song
 *     summary: Search songs by title with fuzzy matching and diacritic normalization
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term for song title (supports diacritic-insensitive and fuzzy matching, e.g., 'dung lam' matches 'Đừng Làm')
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
    await connectDB()

    // Safely decode the query parameter
    let query = ""
    try {
      query = decodeURIComponent(req.nextUrl.searchParams.get("query") || "")
    } catch (error) {
      // If decoding fails, use the raw query string
      query = req.nextUrl.searchParams.get("query") || ""
      console.log("Error decoding query parameter:", error)
    }

    if (!query) {
      return NextResponse.json({ message: "Query parameter is required" }, { status: 400 })
    }

    const songs = await Song.find({
      title: { $regex: query, $options: "i" },
    })
      .collation({ locale: "vi", strength: 1 }) // Tìm kiếm không phân biệt dấu
      .populate("artist", "name")
      .populate("album", "title")

    if (songs.length === 0) {
      return NextResponse.json({ message: "No songs found", songs: [] }, { status: 404 })
    }

    return NextResponse.json({ songs }, { status: 200 })
  } catch (error) {
    console.error("Search Songs Error:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
