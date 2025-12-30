import db from '../config/database.js';

export function getAllMedicines() {
    return db('medicine').select('*');
}

export function getMedicineById(medicineId) {
    return db('medicine').where('medicine_id', medicineId).first();
}

export function addMedicine(medicine) {
    return db('medicine').insert(medicine);
}
