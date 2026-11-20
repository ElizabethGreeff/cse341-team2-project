import {
    createUser,
    findUserByEmail,
    findUserByUsername,
    verifyPassword
} from '../models/users.js';

/**
 * GET /register – render the registration form.
 */
export const registerPage = (req, res) => {
    if (req.user) {
        return res.redirect(req.user.role === 'admin' ? '/admin' : '/');
    }
    res.render('register', {
        title: 'Register',
        error: null,
        formData: {}
    });
};

/**
 * POST /register – create a new customer account.
 */
export const register = async (req, res) => {
    const { displayName, username, email, password, confirmPassword } = req.body;

    const formData = { displayName, username, email };

    try {
        if (!displayName || !username || !email || !password) {
            return res.status(400).render('register', {
                title: 'Register',
                error: 'All fields are required.',
                formData
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).render('register', {
                title: 'Register',
                error: 'Passwords do not match.',
                formData
            });
        }

        if (password.length < 8) {
            return res.status(400).render('register', {
                title: 'Register',
                error: 'Password must be at least 8 characters.',
                formData
            });
        }

        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.status(400).render('register', {
                title: 'Register',
                error: 'An account with that email already exists.',
                formData
            });
        }

        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            return res.status(400).render('register', {
                title: 'Register',
                error: 'That username is already taken.',
                formData
            });
        }

        await createUser(displayName, username, email, password);

        return res.redirect('/login?registered=1');
    } catch (err) {
        console.error('Registration error:', err);

        if (err.code === 11000) {
            return res.status(400).render('register', {
                title: 'Register',
                error: 'An account with that email or username already exists.',
                formData
            });
        }

        return res.status(500).render('register', {
            title: 'Register',
            error: 'Something went wrong. Please try again.',
            formData
        });
    }
};

/**
 * GET /login – render the login form.
 */
export const loginPage = (req, res) => {
    if (req.user) {
        return res.redirect(req.user.role === 'admin' ? '/admin' : '/');
    }

    const registered = req.query.registered === '1';
    res.render('login', {
        title: 'Login',
        error: null,
        success: registered ? 'Registration successful! Please log in.' : null
    });
};

/**
 * POST /login – authenticate and create a session.
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).render('login', {
                title: 'Login',
                error: 'Email and password are required.',
                success: null
            });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).render('login', {
                title: 'Login',
                error: 'Invalid email or password.',
                success: null
            });
        }

        const passwordValid = await verifyPassword(password, user.passwordHash);
        if (!passwordValid) {
            return res.status(401).render('login', {
                title: 'Login',
                error: 'Invalid email or password.',
                success: null
            });
        }

        // Store minimal user info on the session
        req.session.user = {
            id: user._id.toString(),
            displayName: user.displayName,
            username: user.username,
            email: user.email,
            role: user.role.name // 'customer' or 'admin'
        };

        if (user.role.name === 'admin') {
            return res.redirect('/admin');
        }
        return res.redirect('/');
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).render('login', {
            title: 'Login',
            error: 'Something went wrong. Please try again.',
            success: null
        });
    }
};

/**
 * POST /logout – destroy the session and redirect home.
 */
export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
};

/**
 * GET /admin – Admin Dashboard (requires admin role).
 */
export const adminDashboard = (req, res) => {
    res.render('admin/dashboard', {
        title: 'Admin Dashboard'
    });
};