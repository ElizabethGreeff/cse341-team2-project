import { Router } from 'express';
import {
  getSchedulesForTrip,
  getSchedulesForTripAndMonth
} from '../controllers/schedules.js';
import {
  getAllTicketClasses,
  getTicketClassesForDay
} from '../controllers/ticket-classes.js';

const router = Router();

router.get('/trips/:id/schedules', (req, res) => {
  if (req.query.month !== undefined) {
    return getSchedulesForTripAndMonth(req, res);
  }

  return getSchedulesForTrip(req, res);
});

/**
 * @openapi
 * /api/ticket-classes:
 *   get:
 *     summary: Get all ticket classes or filter ticket classes available for a specific day of the week
 *     tags:
 *       - Ticket Classes
 *     parameters:
 *       - in: query
 *         name: day
 *         required: false
 *         description: Optional day of the week (monday through sunday, case-insensitive) to filter available ticket classes
 *         schema:
 *           type: string
 *           enum:
 *             - monday
 *             - tuesday
 *             - wednesday
 *             - thursday
 *             - friday
 *             - saturday
 *             - sunday
 *     responses:
 *       200:
 *         description: A list of matching ticket class objects
 *       400:
 *         description: Invalid day query parameter
 *       500:
 *         description: Failed to fetch ticket classes
 */
router.get('/ticket-classes', (req, res) => {
  if (req.query.day !== undefined) {
    return getTicketClassesForDay(req, res);
  }

  return getAllTicketClasses(req, res);
});

export default router;
