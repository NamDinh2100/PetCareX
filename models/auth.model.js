import db from '../config/database.js';

/**
 * Tìm user trong app_user
 */
export async function findUserByUsername(username) {
    return db('app_user')
        .where('username', username)
        .first();
}

/**
 * Kiểm tra user là CUSTOMER hay không
 */
export async function findCustomer(username) {
    return db('customer')
        .where('username', username)
        .first();
}

/**
 * Kiểm tra user là STAFF hay không
 */
export async function findStaff(username) {
    return db('staff')
        .where('username', username)
        .first();
}
