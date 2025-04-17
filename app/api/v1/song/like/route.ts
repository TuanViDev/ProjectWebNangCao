import { type NextRequest, NextResponse } from "next/server"
import Song from "@/model/Song"
import User from "@/model/User"
import UserLike from "@/model/UserLike"
import connectDB from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

// /**
//  * @swagger
//  * /api/v1/song/like:
//  *   post:
//  *     tags:
//  *       - Song
//  *     summary: Like or unlike a song
//  *     description: Toggle like status for a song. Requires authentication.
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - songId
//  *             properties:
//  *               songId:
//  *                 type: string
//  *                 description: The ID of the song to like/unlike
//  *     responses:
//  *       200:
//  *         description: Successfully liked/unliked the song
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 message:
//  *                   type: string
//  *                 liked:
//  *                   type: boolean
//  *                   description: Current like status (true if liked, false if unliked)
//  *                 likeCount:
//  *                   type: integer
//  *                   description: Updated like count for the song
//  *       400:
//  *         description: Bad request - Missing or invalid song ID
//  *       401:
//  *         description: Unauthorized - Missing or invalid token
//  *       404:
//  *         description: Song not found
//  *       500:
//  *         description: Server error
//  */
// export async function POST(req: NextRequest) {
//   try {
//     await connectDB()

//     // Verify authentication
//     const authHeader = req.headers.get("Authorization")
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized: Missing token",
//         },
//         { status: 401 },
//       )
//     }

//     const token = authHeader.split(" ")[1]
//     let decoded
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string; id: string }
//     } catch (error) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized: Invalid token",
//         },
//         { status: 401 },
//       )
//     }

//     // Get user from token
//     const user = await User.findOne({ email: decoded.email })
//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 },
//       )
//     }

//     // Get song ID from request body
//     const { songId } = await req.json()
//     if (!songId || !mongoose.Types.ObjectId.isValid(songId)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid or missing song ID",
//         },
//         { status: 400 },
//       )
//     }

//     // Find the song
//     const song = await Song.findById(songId)
//     if (!song) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Song not found",
//         },
//         { status: 404 },
//       )
//     }

//     // Check if user has already liked this song
//     const existingLike = await UserLike.findOne({
//       userId: user._id,
//       songId: song._id,
//     })

//     if (existingLike) {
//       // Unlike the song
//       await UserLike.deleteOne({ _id: existingLike._id })
//       song.like = Math.max(0, song.like - 1) // Ensure like count doesn't go below 0
//       await song.save()

//       return NextResponse.json(
//         {
//           success: true,
//           message: "Song unliked successfully",
//           liked: false,
//           likeCount: song.like,
//         },
//         { status: 200 },
//       )
//     } else {
//       // Like the song
//       await UserLike.create({
//         userId: user._id,
//         songId: song._id,
//       })
//       song.like += 1
//       await song.save()

//       return NextResponse.json(
//         {
//           success: true,
//           message: "Song liked successfully",
//           liked: true,
//           likeCount: song.like,
//         },
//         { status: 200 },
//       )
//     }
//   } catch (error: any) {
//     console.error("Like Song Error:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Server error",
//         error: error.message,
//       },
//       { status: 500 },
//     )
//   }
// }

/**
 * @swagger
 * /api/v1/song/like:
 *   get:
 *     tags:
 *       - Song
 *     summary: Check if user has liked a song
 *     description: Check if the authenticated user has liked a specific song
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: songId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the song to check
 *     responses:
 *       200:
 *         description: Successfully retrieved like status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 liked:
 *                   type: boolean
 *                   description: Whether the user has liked the song
 *       400:
 *         description: Bad request - Missing or invalid song ID
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Song not found
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
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string; id: string }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Invalid token",
        },
        { status: 401 },
      )
    }

    // Get user from token
    const user = await User.findOne({ email: decoded.email })
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      )
    }

    // Get song ID from query params
    const url = new URL(req.url)
    const songId = url.searchParams.get("songId")
    if (!songId || !mongoose.Types.ObjectId.isValid(songId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing song ID",
        },
        { status: 400 },
      )
    }

    // Check if song exists
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

    // Check if user has liked the song
    const existingLike = await UserLike.findOne({
      userId: user._id,
      songId: song._id,
    })

    return NextResponse.json(
      {
        success: true,
        liked: !!existingLike,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Check Like Status Error:", error)
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
