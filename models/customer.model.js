import db from '../config/database.js';

export function getAllCustomers() {
    return db.query('SELECT * FROM customers');
}