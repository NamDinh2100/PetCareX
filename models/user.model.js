import db from '../config/database.js';

/* ================= APP USER ================= */

export function findUserByUsername(username) {
    return db('app_user')
        .where('username', username)
        .first();
}

export function findUserById(user_id) {
    return db('app_user')
        .where('user_id', user_id)
        .first();
}

/* ================= CUSTOMER ================= */

export function findCustomer(username) {
    return db('customer')
        .where('username', username)
        .first();
}

export function findCustomerByUserId(user_id) {
    return db('customer')
        .where('user_id', user_id)
        .first();
}

export function getAllCustomers() {
    return db('customer').select();
}

export function getCustomersWithLimit(limit, offset) {
    return db('customer')
        .select()
        .limit(limit)
        .offset(offset);
}

export function getCustomersCount() {
    return db('customer').count('* as total').first();
}

/* ================= STAFF ================= */

export function findStaff(username) {
    return db('staff')
        .where('username', username)
        .first();
}

export function findStaffByUserName(username) {
    return db('staff')
        .where('username', username)
        .first();
}
