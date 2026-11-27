const TRIP_REGION_CLASSES = {
    central: 'central',
    northern: 'northern',
    kansai: 'kansai',
    hokkaido: 'hokkaido'
};

const TRIP_SEASON_CLASSES = {
    spring: 'season-spring',
    summer: 'season-summer',
    autumn: 'season-autumn',
    winter: 'season-winter'
};

const hookTripsCatalog = async () => {
    const listEl = document.getElementById('trips-list');
    const templateEl = document.getElementById('trip-card-template');
    const regionSelect = document.getElementById('region-filter');
    const seasonSelect = document.getElementById('season-filter');
    const loadingEl = document.getElementById('trips-loading');
    const errorEl = document.getElementById('trips-error');
    const emptyEl = document.getElementById('trips-empty');

    if (!listEl || !templateEl || !regionSelect || !seasonSelect) {
        return;
    }

    const showMessage = (element, text) => {
        loadingEl.hidden = true;
        errorEl.hidden = true;
        emptyEl.hidden = true;

        if (element) {
            element.textContent = text;
            element.hidden = false;
        }
    };

    const isTrip = (trip) =>
        trip &&
        typeof trip.id === 'string' &&
        typeof trip.name === 'string' &&
        typeof trip.description === 'string' &&
        typeof trip.region === 'string' &&
        typeof trip.startStation === 'string' &&
        typeof trip.endStation === 'string' &&
        typeof trip.duration === 'string' &&
        Number.isFinite(trip.distance) &&
        Array.isArray(trip.highlights) &&
        trip.highlights.every((highlight) => typeof highlight === 'string') &&
        typeof trip.bestSeason === 'string' &&
        Array.isArray(trip.operatingMonths) &&
        typeof trip.imageUrl === 'string';

    const addFilterOptions = (select, values, allLabel) => {
        const fragment = document.createDocumentFragment();
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = allLabel;
        fragment.appendChild(allOption);

        values.forEach((value) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value.charAt(0).toUpperCase() + value.slice(1);
            fragment.appendChild(option);
        });

        select.replaceChildren(fragment);
    };

    const updateFilterUrl = () => {
        const url = new URL(window.location.href);

        if (regionSelect.value === 'all') {
            url.searchParams.delete('region');
        } else {
            url.searchParams.set('region', regionSelect.value);
        }

        if (seasonSelect.value === 'all') {
            url.searchParams.delete('season');
        } else {
            url.searchParams.set('season', seasonSelect.value);
        }

        window.history.replaceState(null, '', url.toString());
    };

    const renderTrips = (trips) => {
        const selectedRegion = regionSelect.value;
        const selectedSeason = seasonSelect.value;
        const visibleTrips = trips.filter((trip) =>
            (selectedRegion === 'all' || trip.region === selectedRegion) &&
            (selectedSeason === 'all' || trip.bestSeason === selectedSeason)
        );
        const fragment = document.createDocumentFragment();

        visibleTrips.forEach((trip) => {
            const card = templateEl.content.cloneNode(true);
            const cardEl = card.querySelector('.route-card');
            const regionClass = TRIP_REGION_CLASSES[trip.region];
            const seasonClass = TRIP_SEASON_CLASSES[trip.bestSeason];

            if (regionClass) {
                cardEl.classList.add(regionClass);
            }

            card.querySelector('[data-field="name"]').textContent = trip.name;
            card.querySelector('[data-field="region"]').textContent = trip.region;
            card.querySelector('[data-field="startStation"]').textContent = trip.startStation;
            card.querySelector('[data-field="endStation"]').textContent = trip.endStation;
            card.querySelector('[data-field="duration"]').textContent = trip.duration;
            card.querySelector('[data-field="distance"]').textContent = trip.distance;
            card.querySelector('[data-field="description"]').textContent = trip.description;

            const seasonEl = card.querySelector('[data-field="season"]');
            seasonEl.textContent = `Best in ${trip.bestSeason}`;
            if (seasonClass) {
                seasonEl.classList.add(seasonClass);
            }

            const highlightsEl = card.querySelector('[data-field="highlights"]');
            trip.highlights.forEach((highlight) => {
                const tag = document.createElement('span');
                tag.className = 'highlight-tag';
                tag.textContent = highlight;
                highlightsEl.appendChild(tag);
            });

            card.querySelector('[data-field="details"]').href =
                `/trips/${encodeURIComponent(trip.id)}`;
            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        if (visibleTrips.length === 0) {
            showMessage(
                emptyEl,
                trips.length === 0
                    ? 'No trips are available right now.'
                    : 'No trips match the selected filters.'
            );
        } else {
            showMessage(null);
        }
    };

    try {
        const response = await fetch('/api/trips');
        if (!response.ok) {
            throw new Error(`Failed to load trips (${response.status})`);
        }

        const trips = await response.json();
        if (!Array.isArray(trips) || !trips.every(isTrip)) {
            throw new Error('Trip API returned an invalid response');
        }

        const regions = [...new Set(trips.map((trip) => trip.region))].sort();
        const seasons = [...new Set(trips.map((trip) => trip.bestSeason))].sort();
        addFilterOptions(regionSelect, regions, 'All Regions');
        addFilterOptions(seasonSelect, seasons, 'Any Season');

        const query = new URLSearchParams(window.location.search);
        const requestedRegion = query.get('region');
        const requestedSeason = query.get('season');
        regionSelect.value = regions.includes(requestedRegion) ? requestedRegion : 'all';
        seasonSelect.value = seasons.includes(requestedSeason) ? requestedSeason : 'all';
        updateFilterUrl();

        regionSelect.addEventListener('change', () => {
            updateFilterUrl();
            renderTrips(trips);
        });
        seasonSelect.addEventListener('change', () => {
            updateFilterUrl();
            renderTrips(trips);
        });

        renderTrips(trips);
    } catch (error) {
        listEl.replaceChildren();
        showMessage(
            errorEl,
            'Unable to load trips right now. Please try again in a moment.'
        );
    }
};

const hookTrainsCatalog = async () => {
    const listEl = document.getElementById('trains-list');
    const templateEl = document.getElementById('train-card-template');
    const loadingEl = document.getElementById('trains-loading');
    const errorEl = document.getElementById('trains-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trains');
        if (!response.ok) {
            throw new Error(`Failed to load trains (${response.status})`);
        }

        const payload = await response.json();
        const trains = payload.trains || [];
        const fragment = document.createDocumentFragment();

        trains.forEach((train) => {
            const card = templateEl.content.cloneNode(true);
            const imageEl = card.querySelector('[data-field="image"]');

            imageEl.src = train.imageUrl;
            imageEl.alt = train.imageAlt || `${train.name} train`;

            card.querySelector('[data-field="name"]').textContent = train.name;
            card.querySelector('[data-field="operator"]').textContent = train.operator;
            card.querySelector('[data-field="type"]').textContent = train.type;
            card.querySelector('[data-field="speed"]').textContent = `${train.maxSpeedKmh} km/h`;
            card.querySelector('[data-field="seats"]').textContent = `${train.capacity} seats`;
            card.querySelector('[data-field="power"]').textContent = train.powerSource;
            card.querySelector('[data-field="description"]').textContent = train.description;
            card.querySelector('[data-field="best-for"]').textContent = train.bestFor;

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trains right now. Please try again in a moment.';
        }
    }
};

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const hookTripSchedules = () => {
    const container = document.getElementById('trip-schedules');
    const monthSelect = document.getElementById('schedule-month');
    const listEl = document.getElementById('schedules-list');
    const templateEl = document.getElementById('schedule-card-template');
    const loadingEl = document.getElementById('schedules-loading');
    const errorEl = document.getElementById('schedules-error');
    const emptyEl = document.getElementById('schedules-empty');

    if (!container || !monthSelect || !listEl || !templateEl) {
        return;
    }

    const tripId = container.dataset.tripId;

    // Used to ignore slow responses if the user changes the month again before they arrive.
    let latestRequest = 0;

    const showMessage = (el, text) => {
        loadingEl.hidden = true;
        errorEl.hidden = true;
        emptyEl.hidden = true;
        if (el) {
            el.hidden = false;
            el.textContent = text;
        }
    };

    const renderSchedules = (schedules) => {
        const fragment = document.createDocumentFragment();

        schedules.forEach((schedule) => {
            const card = templateEl.content.cloneNode(true);

            card.querySelector('[data-field="departure"]').textContent = schedule.departureTime;
            card.querySelector('[data-field="arrival"]').textContent = schedule.arrivalTime;
            card.querySelector('[data-field="book"]').href = `/trips/booking/${schedule.id}`;

            const daysEl = card.querySelector('[data-field="days"]');
            schedule.daysOfWeek.forEach((day) => {
                const badge = document.createElement('span');
                badge.className = 'day-badge';
                badge.textContent = day.substring(0, 3);
                daysEl.appendChild(badge);
            });

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
    };

    const loadSchedules = async () => {
        const month = monthSelect.value;
        const requestNumber = ++latestRequest;

        let url = `/api/trips/${encodeURIComponent(tripId)}/schedules`;
        if (month) {
            url += `?month=${encodeURIComponent(month)}`;
        }

        listEl.replaceChildren();
        showMessage(loadingEl, 'Loading schedules...');

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load schedules (${response.status})`);
            }

            const schedules = await response.json();
            if (requestNumber !== latestRequest) {
                return;
            }

            if (schedules.length === 0) {
                const where = month ? `in ${MONTH_NAMES[Number(month) - 1]}` : 'for this trip';
                showMessage(emptyEl, `No schedules are available ${where}.`);
                return;
            }

            showMessage(null);
            renderSchedules(schedules);
        } catch (error) {
            if (requestNumber !== latestRequest) {
                return;
            }
            showMessage(errorEl, 'Unable to load schedules right now. Please try again in a moment.');
        }
    };

    monthSelect.addEventListener('change', loadSchedules);
    loadSchedules();
};

document.addEventListener('DOMContentLoaded', () => {
    hookTripsCatalog();
    hookTrainsCatalog();
    hookTripSchedules();
});