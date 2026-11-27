import trip from "./schemas/trips.js";

export async function getTripById(id) {
    return trip.findOne({ id }).select("-_id -__v").lean();
}

export async function getAllTrips() {
    return trip.find({}).select("-_id -__v").lean();
}
