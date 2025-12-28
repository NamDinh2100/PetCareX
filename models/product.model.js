import db from '../config/database.js';

export function getAllProducts() {
    return db('product').select('*');
}

