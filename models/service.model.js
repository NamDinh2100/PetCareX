import db from '../config/database.js';

export function getAllServices() {
    return db('services');
}

export function getServiceByID(service_id) {
    return db('services').where('service_id', service_id).first();
}

export function countByService() {
    return db('services')
    .count('service_id as count').first();
}

export function findPageByService(limit, offset) {
    return db('services')
        .limit(limit)
        .offset(offset)
        .orderBy('service_id', 'asc');
}

export function addService(service) {
    return db('services').insert(service);
}

export function updateService(id, service) {
    return db('services').where('service_id', id).update(service);
}

export function deleteService(id) {
    return db('services').where('service_id', id).del();
}

export function getServiceByName(name) {
    return db('services').where('service_name', 'like', `%${name}%`);
}

export function getServiceByAppointmentID(appointment_id) {
    return db('appointment_services as as')
        .join('services as s', 'as.service_id', 's.service_id')
        .where('as.appointment_id', appointment_id)
        .select('s.service_name');
}