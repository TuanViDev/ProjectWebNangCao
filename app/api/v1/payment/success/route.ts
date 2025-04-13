import dbConnect from "../../../../../lib/mongodb";
import User from "../../../../../model/User";
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

interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: number;
  vip?: {
    expireAt: Date | null;
  };
}

/**
 * @swagger
 * /api/v1/payment/success:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Handle successful payment and grant VIP
 *     description: Updates order status to PAID and grants the user 1 month of VIP status. No authentication required for testing.
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
 *                 description: Payment status (expected: PAID)
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
 *         description: Payment processed successfully
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
    if (!code || !id || cancel === undefined || status !== "PAID" || !orderCode) {
      return NextResponse.json(
        { success: false, message: "Invalid payment parameters" },
        { status: 400 }
      );
    }

    // Kiểm tra cancel
    if (cancel !== false) {
      return NextResponse.json(
        { success: false, message: "Payment was cancelled" },
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
    order.status = "PAID";
    await order.save();

    // Cập nhật VIP cho user
    const vipDuration = 30 * 24 * 60 * 60 * 1000; // 30 ngày
    const expireAt = new Date(Date.now() + vipDuration);

    const user: IUser | null = await User.findById(order.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 400 }
      );
    }

    user.vip = { expireAt };
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Payment processed successfully. VIP granted until " + expireAt.toLocaleDateString("vi-VN"),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}