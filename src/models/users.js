import bcrypt from 'bcrypt';
import User from './schemas/users.js';
import Role from './schemas/roles.js';

/**
 * Create a new user with the customer role by default.
 * @param {string} displayName
 * @param {string} username
 * @param {string} email
 * @param {string} password - plain text password (will be hashed)
 * @returns {Promise<string>} the new user's id as a string
 */
export async function createUser(displayName, username, email, password) {
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
        throw new Error('Default customer role not found. Run db:import first.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
        displayName,
        username,
        email,
        passwordHash,
        role: customerRole._id
    });

    return user._id.toString();
}

/**
 * Find a user by email and populate the role.
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findUserByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).populate('role');
}

/**
 * Find a user by username and populate the role.
 * @param {string} username
 * @returns {Promise<object|null>}
 */
export async function findUserByUsername(username) {
    return User.findOne({ username: username.toLowerCase() }).populate('role');
}

/**
 * Verify a plain-text password against a stored hash.
 * @param {string} password
 * @param {string} passwordHash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

/**
 * Find a user by id and populate the role.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findUserById(id) {
    return User.findById(id).populate('role');
}