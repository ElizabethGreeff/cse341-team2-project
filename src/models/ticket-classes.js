import TicketClass from './schemas/ticket-classes.js';

const getAllTicketClasses = async () => {
  return TicketClass.find({}).sort({ pricePerKm: 1 }).lean();
};

const getTicketClassesForDay = async (day) => {
  const normalizedDay = day.trim().toLowerCase();
  return TicketClass.find({ availableDays: normalizedDay })
    .sort({ pricePerKm: 1 })
    .lean();
};

export { getAllTicketClasses, getTicketClassesForDay };
