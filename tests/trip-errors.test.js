import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const tripModel = vi.hoisted(() => ({
    getAllTrips: vi.fn(),
    getTripById: vi.fn(),
}));

vi.mock("../src/models/trips.js", () => tripModel);

import request from "supertest";
import app from "../app.js";

describe("Trips API database errors", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("GET /api/trips returns a generic 500 response when the query fails", async () => {
        tripModel.getAllTrips.mockRejectedValueOnce(
            new Error("sensitive database failure")
        );

        const response = await request(app).get("/api/trips");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Failed to fetch trips" });
        expect(JSON.stringify(response.body)).not.toContain("sensitive database failure");
    });

    test("GET /api/trips/:id returns a generic 500 response when the query fails", async () => {
        tripModel.getTripById.mockRejectedValueOnce(
            new Error("sensitive database failure")
        );

        const response = await request(app).get("/api/trips/alpine-panorama");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Failed to fetch trip" });
        expect(JSON.stringify(response.body)).not.toContain("sensitive database failure");
    });
});
