import {
  getAllTicketClasses as findAllTicketClasses,
  getTicketClassesForDay as findTicketClassesForDay
} from '../models/ticket-classes.js';
import { VALID_DAYS } from '../models/schemas/ticket-classes.js';

const getAllTicketClasses = async (req, res) => {
  try {
    const ticketClasses = await findAllTicketClasses();
    return res.status(200).json(ticketClasses);
  } catch (error) {
    console.error('Error fetching ticket classes:', error);
    return res.status(500).json({
      error: 'Failed to fetch ticket classes'
    });
  }
};

const getTicketClassesForDay = async (req, res) => {
  try {
    const rawDay = req.query.day;

    if (typeof rawDay !== 'string' || !VALID_DAYS.includes(rawDay.trim().toLowerCase())) {
      return res.status(400).json({
        error: 'day must be a valid day of the week (monday through sunday)'
      });
    }

    const ticketClasses = await findTicketClassesForDay(rawDay);
    return res.status(200).json(ticketClasses);
  } catch (error) {
    console.error('Error fetching ticket classes for day:', error);
    return res.status(500).json({
      error: 'Failed to fetch ticket classes for day'
    });
  }
};

export { getAllTicketClasses, getTicketClassesForDay };
