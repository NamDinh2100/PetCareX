import db from '../config/database.js'

export function getPetByUserID(cus_id) {
    return db('pets').where('owner_id', cus_id);
}

export function getPetByID(pet_id) {
    return db('pets').where('pet_id', pet_id).first();
}   

export function addPet(pet) {
    return db('pets').insert(pet).returning('pet_id');
}

export function updatePetInfo(pet_id, pet) {
    return db('pets').where('pet_id', pet_id).update(pet);
}