import mongoose, { Document, Model, Schema } from "mongoose";

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

const OrderSchema: Schema<IOrder> = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderCode: { type: Number, required: true, unique: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED"],
      default: "PENDING",
    },
    paymentLinkId: { type: String, required: true, unique: true },
    checkoutUrl: { type: String, required: true },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;