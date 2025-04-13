import dbConnect from "../../../../../lib/mongodb";
import Order from "../../../../../model/Order";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/v1/order/cancel:
 *   post:
 *     tags:
 *       - Order
 *     summary: Cancel an order
 *     description: Updates the order status to CANCELLED.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderCode:
 *                 type: number
 *                 description: Order code to cancel
 *             required:
 *               - orderCode
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Invalid order
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

export async function POST(request: Request) {
  try {
    await dbConnect();

    // Lấy token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Lấy orderCode
    const { orderCode } = await request.json();
    if (!orderCode) {
      return NextResponse.json(
        { success: false, message: "Missing orderCode" },
        { status: 400 }
      );
    }

    // Cập nhật order
    const order = await Order.findOneAndUpdate(
      { orderCode, status: "PENDING" },
      { status: "CANCELLED" },
      { new: true }
    );
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found or already processed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}