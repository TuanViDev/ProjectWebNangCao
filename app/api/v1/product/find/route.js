import dbConnect from "../../../../../config/connection";

/**
 * @swagger
 * /api/v1/product/find:
 *   get:
 *     tags:
 *       - Product
 *     description: Find a product by ID
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to find
 *     responses:
 *       200:
 *         description: Product found successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */
import Product from "../../../../../model/Product";

export async function GET(request) {
    try {
        await dbConnect();
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "Product ID is required"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return new Response(JSON.stringify({
                success: false,
                message: "Product not found"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            success: true,
            data: product
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "Error finding product",
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}