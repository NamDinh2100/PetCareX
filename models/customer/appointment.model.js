import db from '../../config/database.js';

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

export function getDoctorsByBranch(branch_id) {
  return db('staff')
    .where({ branch_id, position: 'Doctor' })
    .select('username', 'full_name');
}

/* ⬇️ CHỐT GIÁ TẠI THỜI ĐIỂM ĐẶT */
export async function createAppointmentWithServices(appt, services) {
  return db.transaction(async trx => {
    const [a] = await trx('appointment').insert(appt).returning('*');

    for (const s of services) {
      const sv = await trx('service')
        .where('service_id', s.service_id)
        .first();

      await trx('appointment_service').insert({
        appointment_id: a.appointment_id,
        service_id: s.service_id,
        unit_price: sv.base_price,
        line_discount: 0,
        
        //line_total: sv.base_price
      });
    }
  });
}
