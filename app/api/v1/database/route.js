import dbConnect from "../../../../config/connection";

/**
 * @swagger
 * /api/v1/database:
 *   get:
 *     tags:
 *       - Test
 *     description: Check MongoDB connection status
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */

export async function GET(_request) {
    try {
        await dbConnect();
        return new Response(JSON.stringify({ message: "MongoDB connected successfully!" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Database connection failed", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
