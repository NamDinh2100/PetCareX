import db from '../config/database.js';

export function getAllMedicines() {
    return db('medicines');
}

export function countByMedicine() {
    return db('medicines')
    .count('medicine_id as count').first();
}

export function findPageByMedicine(limit, offset) {
    return db('medicines')
        .limit(limit)
        .offset(offset);
}

export function addMedicine(medicine) {
    return db('medicines').insert(medicine);
}

export function updateMedicine(id, medicine) {
    return db('medicines').where('medicine_id', id).update(medicine);
}

export function getMedicineByName(name) {
    return db('medicines').where('name', 'like', `%${name}%`);
}

export function getMedicineByID(id) {
    return db('medicines').where('medicine_id', id).first();
}