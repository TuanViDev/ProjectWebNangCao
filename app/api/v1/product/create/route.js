import dbConnect from "../../../../../config/connection";


/**
 * @swagger
 * /api/v1/product/create:
 *   post:
 *     tags:
 *       - Product
 *     description: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
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
 *                 default: 0
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
import Product from "../../../../../model/Product";

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, description, price, category, stock, images } = body;

        if (!name || !price) {
            return new Response(JSON.stringify({
                success: false,
                message: "Name and price are required"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            stock: stock || 0,
            images: images || []
        });

        await newProduct.save();

        return new Response(JSON.stringify({
            success: true,
            message: "Product created successfully",
            data: newProduct
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "Error creating product",
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
