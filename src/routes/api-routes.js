import express from "express";
import { getAllBookings } from "../controllers/bookings.js";


const router = express.Router();
/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     description: Returns all bookings.
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: A list of bookings (empty if there are none).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   id:
 *                     type: string
 *                     description: Confirmation code
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error.
 */
router.get("/api/bookings", getAllBookings);

export default router;