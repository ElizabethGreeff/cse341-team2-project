# Feature Set 1: Trips API, Data Model, and Hydrated Trip List

## Description
- Implement the Trips feature using the reviewed Version 2 specification: `spec-week03v2.md`.
- Add the Mongoose Trip schema and model queries, JSON API controllers and routes, and OpenAPI 3 documentation.
- Refactor trip list rendering to hydrate from the API, and move trip page controllers and EJS route registrations to their specified modules.
- Preserve the existing schedule API and booking/confirmation behavior.

## Spec
- Trip documents use the existing seed fields: `id`, `name`, `description`, `region`, `startStation`, `endStation`, `duration`, `distance`, `highlights`, `bestSeason`, `operatingMonths`, and `imageUrl`. The custom `id` is a unique string; `distance` is non-negative kilometers; month values are unique integers from 1 to 12.
- Implement `GET /api/trips` (200 with a JSON array, including `[]`; 500 with `{ "error": "Failed to fetch trips" }`) and `GET /api/trips/:id` (200 with the matching trip object; 404 with `{ "error": "Trip not found" }`; 500 with `{ "error": "Failed to fetch trip" }`). Success bodies are unwrapped and must not expose MongoDB-internal fields.
- Add OpenAPI 3 documentation for both endpoints and retain the existing `GET /api/trips/:id/schedules` documentation and behavior. The schedules route returns 200 for successful requests, 400 for an invalid month, 404 for an unknown trip, and 500 for a query failure.
- Hydrate `src/views/trips/list.ejs` from `GET /api/trips`; retain region/season filters client-side, preserve filter state in the URL, and show loading, error, and empty states. Use safe DOM APIs for API-provided values.
- Move the list/detail page controller functions into `src/controllers/trips.js`, register trip page routes through `src/routes/ejs-routes.js`, and preserve existing trip, booking, and confirmation paths.
- Treat the trip endpoints as public read-only catalog APIs. Keep errors generic, avoid unsafe HTML insertion, and keep image URLs within `/images/`. Pagination is not required for the current small catalog.

## Test Plan
- **Run locally:** Import or seed the test database, then run `npm test` and `npm run lint`.
- **API routes — run locally and repeat against the deployed test environment:**
  - `GET /api/trips`: verify HTTP 200, JSON array shape, required fields, no wrapper, and `[]` for an empty collection.
  - `GET /api/trips/:id`: verify a known ID returns HTTP 200 with one trip object; an unknown ID returns HTTP 404 and the specified error body.
  - `GET /api/trips/:id/schedules`: verify no-month and valid-month requests return HTTP 200 arrays; an invalid month returns HTTP 400 with the specified error; an unknown trip returns HTTP 404.
  - Confirm unexpected database failures produce generic HTTP 500 JSON errors in isolated local tests. Do not induce database outages on a live deployment.
- **Trip list page — run locally and repeat against the deployed test environment in a browser:**
  - `GET /trips` returns HTTP 200 and renders the page shell; the browser fetches `/api/trips` and renders cards from the response.
  - Verify region and season options, combined filtering, URL query restoration/update, and that changing filters does not issue another trips API request.
  - Verify loading, empty-list, no-filter-results, and API-failure states. Confirm text is rendered safely and trip links open the correct details route.
- **Trip details and existing trip/booking routes — run locally and repeat against the deployed test environment:**
  - `GET /trips/:tripId`: verify a known trip renders successfully and an unknown trip returns the standard HTTP 404 page.
  - `GET /trips/booking/:scheduleId`: verify a valid seeded schedule opens the booking page.
  - `POST /trips/book`: submit a valid test booking and verify the existing success/confirmation flow; submit invalid input and verify existing validation behavior.
  - `GET /trips/confirmation/:confirmationId`: verify the confirmation page for the test booking and the existing behavior for an unknown confirmation.
- **Swagger:** Verify the documented trip endpoints include their path parameter, response schemas/examples, and status codes, and that the schedules operation remains documented.
- **Deployment safety:** Use an approved deployed test/staging environment and test records. Do not create real customer bookings or trigger destructive operations while checking deployed routes.
