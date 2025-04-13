import dbConnect from "../../../../../lib/mongodb";
import Order from "../../../../../model/Order";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

interface IOrder extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderCode: number;
  amount: number;
  description: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  paymentLinkId: string;
  checkoutUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * /api/v1/payment/cancel:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Handle cancelled payment
 *     description: Updates order status to CANCELLED. No authentication required for testing.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Payment code
 *               id:
 *                 type: string
 *                 description: Payment ID
 *               cancel:
 *                 type: boolean
 *                 description: Whether the payment was cancelled
 *               status:
 *                 type: string
 *                 description: Payment status (expected: CANCELLED)
 *               orderCode:
 *                 type: number
 *                 description: Order code to identify the order
 *             required:
 *               - code
 *               - id
 *               - cancel
 *               - status
 *               - orderCode
 *     responses:
 *       200:
 *         description: Payment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid parameters or order not found
 *       500:
 *         description: Internal Server Error
 */

export async function POST(request: Request) {
  try {
    await dbConnect();

    // Lấy dữ liệu từ body
    const { code, id, cancel, status, orderCode } = await request.json();

    // Kiểm tra body
    if (!code || !id || cancel === undefined || status !== "CANCELLED" || !orderCode) {
      return NextResponse.json(
        { success: false, message: "Invalid cancellation parameters" },
        { status: 400 }
      );
    }

    // Kiểm tra cancel
    if (cancel !== true) {
      return NextResponse.json(
        { success: false, message: "Payment was not cancelled" },
        { status: 400 }
      );
    }

    // Tìm order
    const order: IOrder | null = await Order.findOne({ orderCode: Number(orderCode) });
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 400 }
      );
    }

    // Kiểm tra trạng thái order
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { success: false, message: "Order already processed" },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái order
    order.status = "CANCELLED";
    await order.save();

    return NextResponse.json(
      {
        success: true,
        message: "Payment cancelled successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error cancelling payment:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}