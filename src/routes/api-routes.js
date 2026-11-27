
import { Router } from "express";
import {
    getSchedulesForTrip,
    getSchedulesForTripAndMonth,
} from "../controllers/schedules.js";
import {
    getAllTrips,
    getTripById,
} from "../controllers/trips.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - description
 *         - region
 *         - startStation
 *         - endStation
 *         - duration
 *         - distance
 *         - highlights
 *         - bestSeason
 *         - operatingMonths
 *         - imageUrl
 *       properties:
 *         id:
 *           type: string
 *           example: alpine-panorama
 *         name:
 *           type: string
 *           example: Alpine Panorama Express
 *         description:
 *           type: string
 *         region:
 *           type: string
 *         startStation:
 *           type: string
 *         endStation:
 *           type: string
 *         duration:
 *           type: string
 *         distance:
 *           type: number
 *           minimum: 0
 *           description: Distance in kilometers
 *         highlights:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: string
 *         bestSeason:
 *           type: string
 *         operatingMonths:
 *           type: array
 *           minItems: 1
 *           uniqueItems: true
 *           items:
 *             type: integer
 *             minimum: 1
 *             maximum: 12
 *         imageUrl:
 *           type: string
 *           pattern: ^/images/
 *     TripError:
 *       type: object
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 */
/**
 * @swagger
 * /api/trips:
 *   get:
 *     tags:
 *       - Trips
 *     summary: Get all trips
 *     responses:
 *       200:
 *         description: Trips returned successfully; an empty list is returned when no trips exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       500:
 *         description: Failed to fetch trips
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TripError'
 */
router.get("/trips", getAllTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     tags:
 *       - Trips
 *     summary: Get a trip by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique trip identifier
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       404:
 *         description: Trip not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TripError'
 *       500:
 *         description: Failed to fetch trip
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TripError'
 */
router.get("/trips/:id", getTripById);

/**
 * @swagger
 * /api/trips/{id}/schedules:
 *   get:
 *     tags:
 *       - Schedules
 *     summary: Get schedules for a trip
 *     description: Returns all schedules for a trip, or schedules for a specific month when the month query parameter is provided.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique trip identifier
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         required: false
 *         description: Month number from 1 to 12
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *     responses:
 *       200:
 *         description: Schedules returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Schedule identifier
 *                   tripId:
 *                     type: string
 *                     description: Trip identifier
 *                   departureTime:
 *                     type: string
 *                     description: Scheduled departure time
 *                   arrivalTime:
 *                     type: string
 *                     description: Scheduled arrival time
 *                   daysOfWeek:
 *                     type: array
 *                     description: Days on which the schedule operates
 *                     items:
 *                       type: string
 *                   status:
 *                     type: boolean
 *                     description: Whether the schedule is active
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Invalid month query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: month must be a whole number from 1 to 12
 *       404:
 *         description: Trip not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Trip not found
 *       500:
 *         description: Failed to fetch schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch schedules
 */
router.get("/trips/:id/schedules", (req, res) => {
    if (req.query.month !== undefined) {
        return getSchedulesForTripAndMonth(req, res);
    }

    return getSchedulesForTrip(req, res);
});

export default router;