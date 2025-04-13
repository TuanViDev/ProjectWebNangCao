import dbConnect from "../../../../../lib/mongodb";
import User from "../../../../../model/User";
import Order from "../../../../../model/Order";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import mongoose, { Document } from "mongoose";

const PayOS = require("@payos/node");
const payOS = new PayOS(
  "84995c02-f9d4-4101-b326-66b27ba50caf",
  "d954c0f0-03f8-4322-97f3-2855814c9ba5",
  "f680d10b2b47a48fb00e383754e34ef6bd8631196c93d50fd0fecba62525bbad"
);

interface DecodedToken extends JwtPayload {
  email: string;
}

interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: number;
  vip?: {
    expireAt: Date | null;
  };
}

interface IOrder extends Document {
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
 * /api/v1/order/create:
 *   post:
 *     tags:
 *       - Order
 *     summary: Create a new order for VIP upgrade
 *     description: Creates an order and generates a PayOS payment link. Requires authentication and no active VIP subscription.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user creating the order
 *               amount:
 *                 type: number
 *                 description: Amount to be paid (in VND)
 *               description:
 *                 type: string
 *                 description: Description of the order
 *             required:
 *               - userId
 *               - amount
 *               - description
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     orderCode:
 *                       type: number
 *                     checkoutUrl:
 *                       type: string
 *       400:
 *         description: Invalid input or user already has VIP
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal Server Error
 */

export async function POST(request: Request) {
  try {
    await dbConnect();

    // Lấy token từ header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret") as DecodedToken;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // Kiểm tra user
    const user: IUser | null = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Kiểm tra VIP
    const isVip = user.vip?.expireAt && new Date(user.vip.expireAt) > new Date();
    if (isVip) {
      return NextResponse.json(
        { success: false, message: "User already has an active VIP subscription" },
        { status: 400 }
      );
    }

    // Lấy dữ liệu từ body
    const { userId, amount, description } = await request.json();
    if (!userId || !amount || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Kiểm tra userId là string hợp lệ
    if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid userId format" },
        { status: 400 }
      );
    }

    // So sánh userId với user._id
    if (userId !== user._id.toString()) {
      console.log(`Mismatch: userId=${userId}, user._id=${user._id.toString()}`); // Debug
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid user ID" },
        { status: 401 }
      );
    }

    // Tạo order code ngẫu nhiên
    const orderCode = Math.floor(Math.random() * 1000000);

    // Tạo payment link với PayOS
    const paymentData = {
      orderCode,
      amount,
      description,
      items: [{ name: "Nâng cấp gói VIP", quantity: 1, price: amount }],
      cancelUrl: `${request.headers.get("origin") || "http://localhost:3000"}/dashboard/payment/cancel`,
      returnUrl: `${request.headers.get("origin") || "http://localhost:3000"}/dashboard/payment/success`,
    };

    const paymentLinkRes = await payOS.createPaymentLink(paymentData);

    // Lưu order vào database
    const order: IOrder = new Order({
      userId,
      orderCode,
      amount,
      description,
      status: "PENDING",
      paymentLinkId: paymentLinkRes.paymentLinkId,
      checkoutUrl: paymentLinkRes.checkoutUrl,
    });

    await order.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: order._id.toString(),
          orderCode: order.orderCode,
          checkoutUrl: order.checkoutUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}