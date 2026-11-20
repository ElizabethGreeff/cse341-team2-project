import { Router } from 'express';
import {
    registerPage,
    register,
    loginPage,
    login,
    logout,
    adminDashboard
} from '../controllers/auth.js';
import { requirePageRole } from '../middleware/auth.js';

const router = Router();

// Registration
router.get('/register', registerPage);
router.post('/register', register);

// Login / Logout
router.get('/login', loginPage);
router.post('/login', login);
router.post('/logout', logout);

// Admin Dashboard – requires signed-in admin
router.get('/admin', requirePageRole('admin'), adminDashboard);

export default router;