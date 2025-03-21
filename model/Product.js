import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        category: { type: String },
        stock: { type: Number, default: 0 },
        images: [{ type: String }],
    },
    { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema, "product");

export default Product;
