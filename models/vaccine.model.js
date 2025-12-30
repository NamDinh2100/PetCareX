import db from '../config/database.js';

export function getAllVaccines() {
    return db('vaccine').select('*');
}

export function addVaccine(vaccine) {
    return db('vaccine').insert(vaccine);
}