/**
 * Session authentication and role-based middleware.
 * loadSessionUser must be registered after the session middleware
 * and before any routes that need req.user / res.locals.user.
 */

export const loadSessionUser = (req, res, next) => {
    req.user = req.session.user || null;
    res.locals.user = req.user;
    next();
};

const isLoggedIn = (req) => Boolean(req.user);

const hasRole = (req, role) => req.user && req.user.role === role;

/**
 * API routes: return 401 JSON if not authenticated.
 */
export const requireApiLogin = (req, res, next) => {
    if (!isLoggedIn(req)) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
};

/**
 * Page routes: redirect to /login if not authenticated.
 */
export const requirePageLogin = (req, res, next) => {
    if (!isLoggedIn(req)) {
        return res.redirect('/login');
    }
    next();
};

/**
 * API routes: 401 if not logged in, 403 if wrong role.
 * @param {string} role - e.g. 'admin' or 'customer'
 */
export const requireApiRole = (role) => (req, res, next) => {
    if (!isLoggedIn(req)) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    if (!hasRole(req, role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

/**
 * Page routes: redirect to /login if not logged in,
 * or render a 403 page if the user lacks the required role.
 * @param {string} role - e.g. 'admin' or 'customer'
 */
export const requirePageRole = (role) => (req, res, next) => {
    if (!isLoggedIn(req)) {
        return res.redirect('/login');
    }
    if (!hasRole(req, role)) {
        return res.status(403).render('errors/403', {
            title: 'Forbidden',
            message: 'You do not have permission to access this page.'
        });
    }
    next();
};