import railTripsRouter from './trips.js';
import { bookingsAdminPage } from '../controllers/bookings.js';
import apiRoutes from './api-routes.js';
import { trainsApi, trainsPage } from './trains.js';
import { Router } from 'express';
import { homePage, aboutPage, testErrorPage } from './index.js';

const router = Router();

// Home page
router.get('/', homePage);

// About page
router.get('/about', aboutPage);

// Trains page
router.get('/trains', trainsPage);

// Trains API
router.get('/api/trains', trainsApi);

// Rail trips
router.use('/trips', railTripsRouter);

// Test 500 error page
router.get('/500', testErrorPage);

// API routes
router.use(apiRoutes);


router.get('/bookings-admin', bookingsAdminPage);

export default router;