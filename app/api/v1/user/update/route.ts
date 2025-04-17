import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongodb";
import User from "../../../../../model/User";
import mongoose from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * @swagger
 * /api/v1/user/update:
 *   put:
 *     tags:
 *       - User
 *     summary: Update a user by ID (Admin only)
 *     description: Allows an admin to update user information including email, password, role, and VIP expiration date by providing the user ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: User's password (optional, only include if updating)
 *                 example: NewPassword123
 *               role:
 *                 type: number
 *                 enum: [0, 1]
 *                 description: User's role (0 for regular user, 1 for admin)
 *                 example: 0
 *               vip:
 *                 type: object
 *                 properties:
 *                   expireAt:
 *                     type: string
 *                     format: date-time
 *                     description: VIP expiration date (null to remove VIP status)
 *                     example: 2025-05-17T00:00:00.000Z
 *             required:
 *               - email
 *               - role
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     role:
 *                       type: number
 *                       example: 0
 *                     vip:
 *                       type: object
 *                       properties:
 *                         expireAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-05-17T00:00:00.000Z
 *       400:
 *         description: Bad Request (Invalid ID or data)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid or missing User ID
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized: Invalid token
 *       403:
 *         description: Forbidden (Admin access required)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Forbidden: Admin access required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error updating user
 *                 error:
 *                   type: string
 *                   example: Unknown error
 */

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    // Validate user ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing User ID",
        },
        { status: 400 }
      );
    }

    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Missing token",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: JwtPayload;

    // Verify JWT token
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Invalid token",
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminUser = await User.findOne({ email: decoded.email });
    if (!adminUser || adminUser.role !== 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Admin access required",
        },
        { status: 403 }
      );
    }

    // Validate request body
    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (body.role !== undefined && ![0, 1].includes(body.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role must be 0 (user) or 1 (admin)",
        },
        { status: 400 }
      );
    }

    // Handle vip.expireAt
    if (body.vip && body.vip.expireAt !== undefined) {
      if (body.vip.expireAt === null) {
        body.vip = { expireAt: null };
      } else {
        const expireAt = new Date(body.vip.expireAt);
        if (isNaN(expireAt.getTime())) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid vip.expireAt date format",
            },
            { status: 400 }
          );
        }
        body.vip = { expireAt };
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating user",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}