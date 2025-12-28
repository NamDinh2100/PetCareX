// import db from '../config/database.js';
import db from '../../config/database.js';

export function getPetMedicalHistory(pet_id) {
  return db('pet as p')
    .join('appointment as a', 'p.pet_id', 'a.pet_id')
    .join('medical_examination as m', 'a.appointment_id', 'm.appointment_id')
    .join('staff as s', 'm.staff_username', 's.username')
    .leftJoin('prescription as pr', 'm.examination_id', 'pr.examination_id')
    .leftJoin('prescription_item as pi', 'pr.prescription_id', 'pi.prescription_id')
    .leftJoin('medicine as me', 'pi.medicine_id', 'me.medicine_id')
    .leftJoin('vaccination as v', 'p.pet_id', 'v.pet_id')
    .leftJoin('vaccine_vaccination as vv', 'v.vaccination_id', 'vv.vaccination_id')
    .leftJoin('vaccine as vc', 'vv.vaccine_id', 'vc.vaccine_id')
    .where('p.pet_id', pet_id)
    .select(
      'm.examination_date',
      's.full_name as doctor_name',
      'm.symptoms',
      'm.diagnosis',
      'm.re_examination_date',
      'me.medicine_name',
      'pi.quantity',
      'vc.vaccine_name',
      'v.vaccination_date'
    )
    .orderBy('m.examination_date', 'desc');
}


export function getPetHistory(pet_id) {
  return db('medical_examination as m')
    .join('staff as s', 'm.staff_username', 's.username')
    .where('m.pet_id', pet_id)
    .select('m.*', 's.full_name')
    .orderBy('m.examination_date', 'desc');
}

export function getPetVaccinationPackages(pet_id) {
  return db('pet_vaccination_package as pvp')
    .join('vaccination_package as vp', 'pvp.package_id', 'vp.package_id')
    .where('pvp.pet_id', pet_id)
    .select('vp.package_name', 'pvp.start_date', 'pvp.end_date', 'pvp.status', 'vp.discount_percentage');
}


// export async function createMedicalExam(data) {
//   const [x] = await db('medical_examination')
//     .insert({
//       pet_id: data.pet_id,
//       appointment_id: data.appointment_id,
//       staff_username: data.staff_username,
//       symptoms: data.symptoms,
//       diagnosis: data.diagnosis,
//       re_examination_date: data.re_examination_date
//     })
//     .returning('*');

//   return x;
// }
export async function createMedicalExam(data) {
  return db.transaction(async trx => {

    // 1. Insert exam (DB tự validate bằng trigger)
    const [exam] = await trx('medical_examination').insert({
      pet_id: data.pet_id,
      appointment_id: data.appointment_id,
      staff_username: data.staff_username,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      re_examination_date: data.re_examination_date
    }).returning('*');

    // 2. KÍCH HOẠT trigger đổi trạng thái appointment → Completed
    await trx('appointment')
      .where('appointment_id', data.appointment_id)
      .update({ status: 'Completed' });

    return exam;
  });
}
