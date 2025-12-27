import db from '../config/database.js';

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
