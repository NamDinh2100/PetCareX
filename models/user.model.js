import db from '../config/database.js';

export function getAllUsers() {
    return db('users').where('role', 'owner');
}

export function countByCustomer() {
    return db('users')
    .where('role', 'owner')
    .count('user_id as count').first();
}

export function findPageByCustomer(limit, offset) {
    return db('users')
        .where('role', 'owner')
        .limit(limit)
        .offset(offset);
}

export function countByEmpID() {
    return db('users')
    .whereNot('role', 'owner')
    .count('user_id as count').first();
}

export function findPageByEmpID(limit, offset) {
    return db('users')
        .whereNot('role', 'owner')
        .limit(limit)
        .offset(offset)
        .orderBy('user_id', 'asc');
}

// USER FUNCTIONS
export function getUserByEmail(email) {
    return db('users').where('email', email).first();
}

export function getUserByID(id) {
    return db('users').where('user_id', id).first();
}

export function addUser(user) {
    return db('users').insert(user);
}

export function updateUser(id, user) {
    return db('users').where('user_id', id).update(user);
}

export function updatePassword(id, hashedPassword) {
    return db('users').where('user_id', id).update({ password: hashedPassword });
}

export function deleteUser(id) {
    return db('users').where('id', id).del();
}

export function getPetByID(user_id) {
    return db('pets').where('owner_id', user_id);
}

// VETERINARIAN-SPECIFIC FUNCTIONS
export function getAllVeterinarians() {
    return db('users').where('role', 'veterinarian');
}  

// Employee-specific functions
export function getAllEmployees() {
    return db('users').whereNot('role', 'owner');
}

export function addEmployee(employee) {
    return db('users').insert(employee);
}

export function getEmployeeByID(id) {
    return db('users').where('user_id', id).first();
}

export function updateEmployee(id, employee) {
    return db('users').where('user_id', id).update(employee);
}

export function deleteEmployee(id) {
    return db('users').where('user_id', id).del();
}
