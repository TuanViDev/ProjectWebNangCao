import dbConnect from "../../../../../lib/mongodb";
import User from "../../../../../model/User";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/v1/user/find:
 *   get:
 *     tags:
 *       - User
 *     summary: Find a user by ID or get own profile
 *     description: Authenticated users can find their own profile without admin rights. Finding other users requires admin access.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *         description: The ID of the user to find (optional, if omitted, returns authenticated user's profile)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User found successfully
 *       400:
 *         description: Invalid User ID
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required for finding other users
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

export async function GET(request) {
  try {
    await dbConnect();
    const url = new URL(request.url, `http://localhost`);
    const id = url.searchParams.get("id");

    // Lấy token từ header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized: Missing token",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized: Invalid token",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Tìm user hiện tại dựa trên email từ token
    const currentUser = await User.findOne({ email: decoded.email });
    if (!currentUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Nếu không có ID, trả về thông tin của user hiện tại
    if (!id) {
      return new Response(
        JSON.stringify({
          success: true,
          data: currentUser,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Nếu có ID, kiểm tra quyền admin
    if (currentUser.role !== 1) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Forbidden: Admin access required",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid User ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Tìm user theo ID
    const user = await User.findById(id);
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: user,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error finding user",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}