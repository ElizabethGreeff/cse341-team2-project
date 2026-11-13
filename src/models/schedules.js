import mongoose from "mongoose";
import schedule from "./schemas/schedules.js";

export async function getSchedulesByTripId(tripId, month) {
    const trip = await mongoose.connection
        .collection("trips")
        .findOne({ id: tripId }, { projection: { operatingMonths: 1 } });

    if (!trip) {
        return null;
    }

    if (month !== undefined && !(trip.operatingMonths || []).includes(month)) {
        return [];
    }

    return schedule.find({ tripId }).sort({ id: 1 }).lean();
}