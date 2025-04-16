import { NextRequest, NextResponse } from "next/server"
import Song from "@/model/Song"
import connectDB from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import "@/model/Artist"
import "@/model/Album"

/**
 * @swagger
 * /api/v1/song/by-artist:
 *   get:
 *     tags:
 *       - Song
 *     summary: Get songs by artist ID (User must be logged in)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: artistId
 *         in: query
 *         description: ID of the artist
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of songs by the specified artist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       artist:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       album:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Bad request - Missing or invalid artist ID
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: No songs found for this artist
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
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

    // Get artistId from query params
    const url = new URL(req.url)
    const artistId = url.searchParams.get("artistId")

    // Validate artistId
    if (!artistId || !mongoose.Types.ObjectId.isValid(artistId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing artist ID",
        },
        { status: 400 },
      )
    }

    // Get pagination params
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Find songs by artist ID
    const songs = await Song.find({ artist: artistId })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate("artist", "name")
      .populate("album", "title")

    const total = await Song.countDocuments({ artist: artistId })

    if (songs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No songs found for this artist",
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: songs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get Songs By Artist Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
