//src/models/schemas/bookings.js
import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    scheduleId: {
        type: Number,
        required: true,
    },
    tripId: {
        type: String,
        required: true,
        trim: true,
    },
    ticketClass: {
        type: String,
        required: true,
        trim: true,
    },
    selectedDay: {
        type: String,
        required: true,
        trim: true,
    },
    passengers: {
        type: [passengerSchema],
        required: true,
    },
});

const booking = mongoose.model("Booking", bookingSchema);

export default booking;