import { describe, expect, test } from "vitest";
import request from "supertest";
import app from "../app.js";
import { getDb } from "../src/db/connect.js";
import Trip from "../src/models/schemas/trips.js";

const validateDocument = async (document) => {
    let validationError;

    try {
        await document.validate();
    } catch (error) {
        validationError = error;
    }

    return { validationError };
};

describe("Trips API", () => {
    test("GET /api/trips returns the seeded trips as an unwrapped array", async () => {
        const response = await request(app).get("/api/trips");

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(6);
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: "alpine-panorama",
                    name: "Alpine Panorama Express",
                    distance: 180,
                }),
            ])
        );
        expect(response.body[0]).not.toHaveProperty("_id");
        expect(response.body[0]).not.toHaveProperty("__v");
    });

    test("GET /api/trips returns an empty array when the collection is empty", async () => {
        await getDb().collection("trips").deleteMany({});

        const response = await request(app).get("/api/trips");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    test("GET /api/trips/:id returns one trip or a not-found error", async () => {
        const response = await request(app).get("/api/trips/alpine-panorama");
        const missingResponse = await request(app).get("/api/trips/not-a-trip");

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id: "alpine-panorama",
            name: "Alpine Panorama Express",
        });
        expect(response.body).not.toHaveProperty("_id");
        expect(response.body).not.toHaveProperty("__v");
        expect(missingResponse.status).toBe(404);
        expect(missingResponse.body).toEqual({ error: "Trip not found" });
    });

    test("trip schema enforces month and image path constraints", async () => {
        const validTrip = {
            id: "test-trip",
            name: "Test Trip",
            description: "A test trip description",
            region: "central",
            startStation: "nagoya",
            endStation: "toyama",
            duration: "4.5 hours",
            distance: 180,
            highlights: ["Mountain views"],
            bestSeason: "autumn",
            operatingMonths: [4, 5, 6],
            imageUrl: "/images/routes/test-trip.png",
        };

        await expect(new Trip(validTrip).validate()).resolves.toBeUndefined();

        const { validationError: duplicateMonthsError } = await validateDocument(new Trip({
            ...validTrip,
            operatingMonths: [4, 4],
        }));
        expect(duplicateMonthsError.errors.operatingMonths).toBeDefined();

        const { validationError: fractionalMonthError } = await validateDocument(new Trip({
            ...validTrip,
            operatingMonths: [4.5],
        }));
        expect(fractionalMonthError.errors.operatingMonths).toBeDefined();

        const { validationError: invalidImageError } = await validateDocument(new Trip({
            ...validTrip,
            imageUrl: "javascript:alert(1)",
        }));
        expect(invalidImageError.errors.imageUrl).toBeDefined();
    });
});

describe("Trip-related routes", () => {
    test("schedule endpoint behavior and status codes remain intact", async () => {
        const allSchedules = await request(app)
            .get("/api/trips/alpine-panorama/schedules");
        const filteredSchedules = await request(app)
            .get("/api/trips/alpine-panorama/schedules?month=4");
        const unsupportedMonth = await request(app)
            .get("/api/trips/winter-wetlands/schedules?month=4");
        const invalidMonth = await request(app)
            .get("/api/trips/alpine-panorama/schedules?month=13");
        const missingTrip = await request(app)
            .get("/api/trips/not-a-trip/schedules");

        expect(allSchedules.status).toBe(200);
        expect(allSchedules.body).toHaveLength(2);
        expect(filteredSchedules.status).toBe(200);
        expect(filteredSchedules.body).toHaveLength(2);
        expect(unsupportedMonth.status).toBe(200);
        expect(unsupportedMonth.body).toEqual([]);
        expect(invalidMonth.status).toBe(400);
        expect(invalidMonth.body).toEqual({
            error: "month must be a whole number from 1 to 12",
        });
        expect(missingTrip.status).toBe(404);
        expect(missingTrip.body).toEqual({ error: "Trip not found" });
    });

    test("trip list and details pages render using trip API data", async () => {
        const listResponse = await request(app).get("/trips");
        const detailsResponse = await request(app).get("/trips/alpine-panorama");
        const missingResponse = await request(app).get("/trips/not-a-trip");

        expect(listResponse.status).toBe(200);
        expect(listResponse.text).toContain('id="trip-card-template"');
        expect(listResponse.text).toContain('id="trips-loading"');
        expect(listResponse.text).not.toContain("Alpine Panorama Express");
        expect(detailsResponse.status).toBe(200);
        expect(detailsResponse.text).toContain("Alpine Panorama Express");
        expect(missingResponse.status).toBe(404);
        expect(missingResponse.text).toContain("Page Not Found");
    });

    test("booking, submission, and confirmation routes remain functional", async () => {
        const bookingPage = await request(app).get("/trips/booking/1");
        const bookingResponse = await request(app)
            .post("/trips/book")
            .type("form")
            .send(
                "scheduleId=1&tripId=alpine-panorama&ticketClass=standard&selectedDay=monday" +
                    "&passengers%5B0%5D%5BfirstName%5D=Test&passengers%5B0%5D%5BlastName%5D=Passenger" +
                    "&passengers%5B0%5D%5Bemail%5D=test%40example.com" +
                    "&passengers%5B0%5D%5Bphone%5D=%2B1%20555-0100"
            );

        expect(bookingPage.status).toBe(200);
        expect(bookingPage.text).toContain('action="/trips/book"');
        expect(bookingResponse.status).toBe(302);
        expect(bookingResponse.headers.location).toMatch(/^\/trips\/confirmation\//);

        const confirmationResponse = await request(app).get(bookingResponse.headers.location);
        expect(confirmationResponse.status).toBe(200);
        expect(confirmationResponse.text).toContain("Test Passenger");
    });
});
