import dbConnect from "../../../../config/connection";

/**
 * @swagger
 * /api/v1/product:
 *   get:
 *     tags:
 *       - Product
 *     description: Returns the product list
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
import Product from "../../../../model/Product";

export async function GET(request) {
    try {
        await dbConnect();
        // Lấy query parameters từ request
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get("page")) || 1;
        const limit = parseInt(url.searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        // Lấy danh sách sản phẩm từ MongoDB
        const products = await Product.find().skip(skip).limit(limit);
        const total = await Product.countDocuments();

        return new Response(JSON.stringify({
            success: true,
            data: products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "Lỗi khi lấy danh sách sản phẩm",
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}