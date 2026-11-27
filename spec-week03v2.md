# Feature Set 1: Trips

## 1. Purpose

This specification defines the requirements for moving trip data access to Mongoose, exposing trips through JSON API endpoints, and rendering the trip list using client-side hydration. It also covers consolidating trip-page controllers and routing while preserving the existing trip and booking experience.

## 2. Scope

### In scope

- Add a Mongoose Trip schema and model query functions.
- Add JSON API controller functions and routes for listing trips and retrieving one trip.
- Hydrate the trip list page from the trips API instead of rendering trip records with EJS.
- Move the trip list and trip detail page controller functions into `src/controllers/trips.js`.
- Register trip EJS routes through `src/routes/ejs-routes.js`.
- Preserve the existing trip schedule API route and its Swagger documentation.
- Preserve region and season filtering on the hydrated trip list, applying filters client-side.

### Out of scope

- Changes to schedule, train, booking, confirmation, authentication, or database seed behavior.
- Changes to trip content, visual design, or the trip-detail page's schedule hydration.
- New filtering or pagination API parameters.
- Replacing or changing the existing trip seed data.

## 3. Current project context

- Trip documents are represented in `src/db/seeds/trips.json`.
- The existing trip list view is `src/views/trips/list.ejs` (the task description refers to `src/view/trips/list.ejs`; this specification uses the actual repository path).
- Trip page routing currently lives in `src/routes/trips.js`; `src/routes/router.js` mounts it at `/trips`.
- The schedule endpoint and its OpenAPI documentation are in `src/routes/api-routes.js`.
- The existing train API uses Mongoose-backed model functions and JSON controller responses as a project pattern.
- Global middleware sets `res.locals.query` from the URL query string for EJS views. Hydration must continue to initialize filter selections from the URL and update that URL when selections change.

## 4. Trip data model

Create `src/models/schemas/trips.js` with a Mongoose schema for the existing trip document shape. All string fields must be non-empty and trimmed.

| Field | Type | Requirement |
| --- | --- | --- |
| `id` | String | Required, unique, trimmed trip identifier |
| `name` | String | Required |
| `description` | String | Required |
| `region` | String | Required |
| `startStation` | String | Required |
| `endStation` | String | Required |
| `duration` | String | Required |
| `distance` | Number | Required; non-negative |
| `highlights` | Non-empty array of strings | Required |
| `bestSeason` | String | Required |
| `operatingMonths` | Non-empty array of integers | Required; each value is from 1 through 12 |
| `imageUrl` | String | Required; a same-origin path under `/images/` |

`distance` is measured in kilometers. `region` and `bestSeason` are non-empty strings; the schema must not hard-code a closed list of values. `highlights` must contain at least one string. `operatingMonths` must contain at least one integer and must not contain duplicates.

The model must use the MongoDB `trips` collection and export the Mongoose model consistently with the repository's existing schema modules. The unique `id` field must be backed by a database unique index. No trip fields beyond those listed above are required for Version 1.

## 5. Trip model functions

Create `src/models/trips.js` using the Trip schema. The model module must export:

- `getTripById(id)`: find one trip by its public `id` field and return a plain JavaScript object or `null` when no trip matches.
- `getAllTrips()`: return all trips as plain JavaScript objects. An empty collection returns an empty array. Result order is unspecified in Version 1.

Both functions must query MongoDB through Mongoose, use lean results, and allow database errors to propagate to their callers. Public results must not expose MongoDB-internal `_id` or `__v` fields.

## 6. JSON API

Create or update `src/controllers/trips.js` with the following API controller functions. The API responses use JSON and return the trip object or array directly, not an additional wrapper object. Each error response has the exact shape `{ "error": "<message>" }`; internal exception details must not be sent to clients.

### 6.1 `GET /api/trips`

Returns all trips.

| Status | Response |
| --- | --- |
| `200 OK` | JSON array of trip objects; an empty array when there are no trips |
| `500 Internal Server Error` | `{ "error": "Failed to fetch trips" }` when trips cannot be fetched |

Example success response:

```json
[
  {
    "id": "alpine-panorama",
    "name": "Alpine Panorama Express",
    "description": "Journey through the Japanese Alps with stunning mountain views and traditional villages.",
    "region": "central",
    "startStation": "nagoya",
    "endStation": "toyama",
    "duration": "4.5 hours",
    "distance": 180,
    "highlights": ["Mount Tateyama views", "Hida River gorge"],
    "bestSeason": "autumn",
    "operatingMonths": [4, 5, 6, 7, 8, 9, 10, 11],
    "imageUrl": "/images/routes/alpine-panorama.png"
  }
]
```

### 6.2 `GET /api/trips/{id}`

Returns the trip whose public `id` matches the path parameter.

| Status | Response |
| --- | --- |
| `200 OK` | JSON trip object |
| `404 Not Found` | `{ "error": "Trip not found" }` when no trip matches the requested ID |
| `500 Internal Server Error` | `{ "error": "Failed to fetch trip" }` when the trip cannot be fetched |

Example success response (same fields as one item in `GET /api/trips`):

```json
{
  "id": "alpine-panorama",
  "name": "Alpine Panorama Express",
  "description": "Journey through the Japanese Alps with stunning mountain views and traditional villages.",
  "region": "central",
  "startStation": "nagoya",
  "endStation": "toyama",
  "duration": "4.5 hours",
  "distance": 180,
  "highlights": ["Mount Tateyama views", "Hida River gorge"],
  "bestSeason": "autumn",
  "operatingMonths": [4, 5, 6, 7, 8, 9, 10, 11],
  "imageUrl": "/images/routes/alpine-panorama.png"
}
```

The `id` path parameter is required and is a string. Any ID that does not match a trip returns `404`; there is no separate `400` response for an unknown string ID. Database/query failures must not be reported as successful responses.

### 6.3 API routes

Register both API routes in `src/routes/api-routes.js`, which is mounted at `/api`:

- `GET /trips` — all trips.
- `GET /trips/:id` — one trip by ID.

The fully mounted paths are `/api/trips` and `/api/trips/:id`. Keep the existing `GET /api/trips/:id/schedules` route and its Swagger documentation working and unchanged in behavior.

Add swagger-jsdoc OpenAPI 3 documentation for both new trip endpoints in `src/routes/api-routes.js`, using a `Trips` tag and documenting the `id` path parameter, success response schemas, and applicable error responses. Keep the existing schedules operation documentation in the same file.

For `GET /api/trips`, document `200` and `500`; for `GET /api/trips/{id}`, document `200`, `404`, and `500`. The documented response schemas and examples must match the JSON contracts above.

### 6.4 schedule route 

The `GET /api/trips/:id/schedules` route contract:

| Request | Status | Response |
| --- | --- | --- |
| No `month` query parameter | `200` | JSON array of schedule objects |
| `month` is a whole number from 1 through 12 | `200` | JSON array of schedules for that month; `[]` if none operate then |
| `month` is invalid | `400` | `{ "error": "month must be a whole number from 1 to 12" }` |
| Trip does not exist | `404` | `{ "error": "Trip not found" }` |
| Query fails | `500` | `{ "error": "Failed to fetch schedules" }` |

This route is included to make the trip-related API route inventory explicit; implementation must preserve its existing behavior and Swagger operation.

For a monthly request, month validation occurs before looking up the trip, so an invalid month returns `400` even if the trip ID is unknown.

## 7. Trip list page hydration

Update `src/views/trips/list.ejs` so EJS renders the page shell, filter controls, loading/error/empty states, and any reusable card template, but does not iterate over trip data or render trip cards from server-provided trip locals.

Client-side JavaScript must:

1. Fetch `GET /api/trips` when the page loads.
2. Populate trip cards from the returned array.
3. Populate region and season options from the fetched trips and apply both filters client-side without another API request or a full page reload.
4. Read any initial `region` and `season` selections from the page URL, and update the URL query string when a filter changes so selections can be bookmarked and restored. Accept only values present in the fetched options; fall back to `all`/`any` for unknown values. The client must not require trip data or unique-filter locals from EJS.
5. Provide a visible loading state while the request is pending.
6. Provide a visible error state if the request fails, returns a non-success status, or returns a body that is not a trip array.
7. Show an appropriate empty state when the API returns no trips or when the selected filters match no trips.
8. Preserve the existing card information and the `/trips/{id}` details link.
9. Insert API-provided text as text rather than interpreting it as HTML.

Use the existing train catalog hydration in `src/views/trains.ejs` and `public/js/main.js` as the implementation pattern where applicable.

## 8. EJS page controllers and routing

### 8.1 EJS page controllers

Move the trip page controller functions currently implemented in `src/routes/details.js` and `src/routes/list.js` into `src/controllers/trips.js`, giving each a clear exported name, such as:

- `tripDetailsPage(req, res)`: use the new `getTripById` model function to obtain the trip and render the trip details view.
- `listTripsPage(req, res)`: render the trip list page without querying the trips model or passing a trips array to the template. The browser obtains trip data through the API.

The trip detail page must preserve its current view and title behavior. A missing trip must return the application's not-found page with HTTP status `404`. A database failure must be passed to the existing error handling path and result in an HTTP `500`, not a successful page render.

### 8.2 EJS routing

Create `src/routes/ejs-routes.js` for the trip EJS route registrations. It must use the named EJS page controller functions from `src/controllers/trips.js`.

The EJS route module contains route registrations only; the EJS page controller implementations belong in `src/controllers/trips.js`. It must preserve the existing user-facing trip and booking paths, including:

- `GET /trips` — trip list HTML.
- `GET /trips/:tripId` — trip details HTML.
- `GET /trips/booking/:scheduleId` — booking page HTML.
- `POST /trips/book` — existing booking submission.
- `GET /trips/confirmation/:confirmationId` — confirmation page HTML.

Update `src/routes/router.js` to mount the EJS route module at `/trips`. Remove or adapt old route registrations as needed so each URL has one handler and existing booking flows continue to work.

The booking and confirmation handlers are preserved, not redesigned by this feature. Their existing form and response behavior remains authoritative.

These are HTML routes, not JSON API routes. `GET /trips` returns the page shell with status `200`; API hydration failures are presented in the page after load. The trip details page returns rendered HTML with status `200`, the standard not-found page with status `404`, or the standard server-error page with status `500`. Booking and confirmation response behavior is unchanged.

## 9. Acceptance criteria

1. `src/models/schemas/trips.js` defines the trip fields and types in Section 4.
2. `src/models/trips.js` exports working `getTripById` and `getAllTrips` Mongoose queries.
3. `GET /api/trips` returns a JSON array with status `200`, including an empty array when no trips exist.
4. `GET /api/trips/{id}` returns the matching JSON trip with status `200`, or a not-found response with status `404`.
5. API query failures return JSON error responses with status `500`.
6. Both API endpoints are registered under `/api` and do not conflict with the schedule endpoint.
7. The trip list view contains no EJS iteration over trip records; cards are created from the API response in the browser.
8. Region and season filters work on hydrated trip data, and loading, failure, and empty states are visible.
9. The trip details view uses the new trip model function and retains its existing route.
10. The trip EJS page controllers are exported from `src/controllers/trips.js`, and trip EJS routes are registered in `src/routes/ejs-routes.js`.
11. Existing trip details, schedule retrieval, booking, and confirmation paths continue to function.
12. OpenAPI 3 Swagger documentation describes both new trip endpoints, and the existing schedules operation documentation remains present and accurate.
13. API errors use the exact JSON shapes and status codes in Section 6, and responses do not leak database exception details or MongoDB-internal fields.
14. The list page restores valid filter values from the URL, updates the URL on filter changes, and applies filters without re-fetching the trip list.

## 10. Verification expectations

Implementation should include focused tests for the trip API success and error cases, and verify that the list page can render its shell and hydrate from the API. Run the repository's existing test suite or the smallest relevant test set after implementation.

## 11. Security considerations

- Trip API endpoints are public, read-only catalog endpoints and return no user or booking data; authentication is not required for these two endpoints.
- Treat API-provided trip values as untrusted in the browser. Use `textContent`/text nodes for text, encode the trip ID when building the details URL, and never build cards with `innerHTML`.
- Populate filter options using DOM APIs; do not interpolate API values into HTML or CSS class names.
- `imageUrl` must remain a same-origin `/images/` path; do not allow executable schemes such as `javascript:` or arbitrary external URLs.
- Match the route ID as a string value in a fixed Mongoose filter. Do not accept client-supplied MongoDB query objects or operators.
- API controllers must return only generic error messages to clients and log unexpected database errors server-side. The existing HTML error view exposes stack details only in development; production responses must remain generic.