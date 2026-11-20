import Role from './schemas/roles.js';

/**
 * Ensure the standard roles exist in the database.
 * Creates 'customer' and 'admin' if they are missing.
 */
export async function ensureRolesExist() {
    const roles = ['customer', 'admin'];

    for (const name of roles) {
        const existing = await Role.findOne({ name });
        if (!existing) {
            await Role.create({ name });
            console.log(`Created role: ${name}`);
        }
    }
}

/**
 * Get a role by name.
 * @param {string} name
 * @returns {Promise<object|null>}
 */
export async function getRoleByName(name) {
    return Role.findOne({ name });
}

/**
 * Get all roles.
 * @returns {Promise<object[]>}
 */
export async function getAllRoles() {
    return Role.find({}).lean();
}