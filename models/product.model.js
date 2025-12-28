import db from '../config/database.js';

export function getAllProducts() {
    return db('product').select('*');
}

export function addProduct(product) {
    return db('product').insert(product);
}