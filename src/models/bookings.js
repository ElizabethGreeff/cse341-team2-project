//src/models/bookings.js
import booking from "./schemas/bookings.js";

export async function createBooking(bookingData) {
    return booking.create(bookingData);
}

export async function getAllBookings() {
    return booking.find({}).lean();
}

export async function getBookingById(id) {
    return booking.findOne({ id }).lean();
}