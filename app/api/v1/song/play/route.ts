import { type NextRequest, NextResponse } from "next/server"
import Song from "@/model/Song"
import connectDB from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

/**
 * @swagger
 * /api/v1/song/play:
 *   post:
 *     tags:
 *       - Song
 *     summary: Increment play count for a song
 *     description: Increment the play count when a song is played. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - songId
 *             properties:
 *               songId:
 *                 type: string
 *                 description: The ID of the song being played
 *     responses:
 *       200:
 *         description: Successfully incremented play count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 playCount:
 *                   type: integer
 *                   description: Updated play count for the song
 *       400:
 *         description: Bad request - Missing or invalid song ID
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Song not found
 *       500:
 *         description: Server error
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Verify authentication
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Missing token",
        },
        { status: 401 },
      )
    }

    const token = authHeader.split(" ")[1]
    try {
      jwt.verify(token, process.env.JWT_SECRET as string)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Invalid token",
        },
        { status: 401 },
      )
    }

    // Get song ID from request body
    const { songId } = await req.json()
    if (!songId || !mongoose.Types.ObjectId.isValid(songId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing song ID",
        },
        { status: 400 },
      )
    }

    // Find and update the song's play count
    const song = await Song.findById(songId)
    if (!song) {
      return NextResponse.json(
        {
          success: false,
          message: "Song not found",
        },
        { status: 404 },
      )
    }

    // Increment play count
    song.play += 1
    await song.save()

    return NextResponse.json(
      {
        success: true,
        message: "Play count incremented successfully",
        playCount: song.play,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Increment Play Count Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
