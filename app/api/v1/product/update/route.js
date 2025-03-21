import dbConnect from "../../../../../config/connection";

/**
 * @swagger
 * /api/v1/product/update:
 *   put:
 *     tags:
 *       - Product
 *     description: Update a product by ID
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */
import Product from "../../../../../model/Product";

export async function PUT(request) {
    try {
        await dbConnect();
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const body = await request.json();

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "Product ID is required"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });

        if (!updatedProduct) {
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
            message: "Product updated successfully",
            data: updatedProduct
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "Error updating product",
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}