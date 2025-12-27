import db from '../config/database.js';

/* 1. Thú cưng của khách */
export function getPets(username) {
  return db('pet').where('owner_username', username);
}

/* 2. Chi nhánh */
export function getBranches() {
  return db('branch');
}

/* 3. Dịch vụ theo chi nhánh (branch_service) */
export function getServicesByBranch(branchId) {
  return db('service as s')
    .join('branch_service as bs', 's.service_id', 'bs.service_id')
    .where('bs.branch_id', branchId)
    .select('s.service_id', 's.service_name', 's.base_price');
}

/* 4. Kiểm tra khung giờ */
export async function isSlotAvailable(branchId, date, time) {
  const row = await db('appointment')
    .where({
      branch_id: branchId,
      appointment_date: date,
      appointment_time: time
    })
    .first();

  return !row;
}

/* 5. Tạo lịch hẹn */
export async function createAppointment(data) {
  const [appointment] = await db('appointment')
    .insert({
      appointment_date: data.date,
      appointment_time: data.time,
      status: 'Scheduled',
      pet_id: data.petId,
      branch_id: data.branchId,
      username: data.username
    })
    .returning('appointment_id');

  return appointment.appointment_id;
}

/* 6. Gán nhiều dịch vụ cho lịch */
export function addServices(appointmentId, serviceIds) {
  const rows = serviceIds.map(sid => ({
    appointment_id: appointmentId,
    service_id: sid
  }));

  return db('appointment_service').insert(rows);
}
