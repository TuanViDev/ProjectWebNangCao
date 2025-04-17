import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/model/User";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     tags:
 *       - User
 *     summary: Get list of users (Admin only)
 *     description: Retrieves a paginated list of users. Only accessible by admin users.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal Server Error
 */

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Lấy token từ header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: Missing token",
      }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: Invalid token",
      }, { status: 401 });
    }

    const adminUser = await User.findOne({ email: decoded.email });
    if (!adminUser || adminUser.role !== 1) {
      return NextResponse.json({
        success: false,
        message: "Forbidden: Admin access required",
      }, { status: 403 });
    }

    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Error fetching users",
      error: error.message || "Unknown error",
    }, { status: 500 });
  }
}