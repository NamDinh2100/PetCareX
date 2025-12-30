
import db from '../../config/database.js';


//Aaaaaaaaaaaaaaaaaaaaaaaaaaaaa
export function getTodayAppointmentsByDoctor(username) {
  return db('appointment as a')
    .join('pet as p', 'a.pet_id', 'p.pet_id')
    .join('customer as c', 'p.owner_username', 'c.username')
    .where('a.staff_username', username)
    .whereRaw('a.appointment_date = CURRENT_DATE')
    .orderBy('a.appointment_time', 'asc')
    .select('a.*', 'p.name', 'c.full_name');
}

export function getMyAppointments(username) {
  return db('appointment as a')
    .join('pet as p', 'a.pet_id', 'p.pet_id')
    .join('customer as c', 'p.owner_username', 'c.username')
    .where('a.staff_username', username)
    .whereIn('a.status', ['Scheduled'])
    .orderBy('a.appointment_date', 'asc')   // ngày trước
    .orderBy('a.appointment_time', 'asc')   // giờ trước
    .select('a.*', 'p.name', 'c.full_name');
}