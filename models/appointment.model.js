import db from '../config/database.js';

export function getBranches() {
  return db('branch');
}

export function getPetsByCustomer(username) {
  return db('pet').where('owner_username', username);
}

export function getServicesByBranch(branch_id) {
  return db('branch_service as bs')
    .join('service as s', 'bs.service_id', 's.service_id')
    .where('bs.branch_id', branch_id)
    .select('s.service_id', 's.service_name', 's.base_price');
}

export async function isTimeAvailable(branch_id, date, time) {
  const x = await db('appointment')
    .where({ branch_id, appointment_date: date, appointment_time: time })
    .first();
  return !x;
}

export async function createAppointmentWithServices(appt, services) {
  return db.transaction(async trx => {
    const [a] = await trx('appointment').insert(appt).returning('*');

    for (const s of services) {
      await trx('appointment_service').insert({
        appointment_id: a.appointment_id,
        service_id: s.service_id,
        unit_price: 0,
        line_discount: 0,
        line_total: 0
      });
    }
  });
}
