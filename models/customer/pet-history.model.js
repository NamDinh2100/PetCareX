import db from '../../config/database.js';

export function findPetsByCustomerKeyword(keyword){
  return db('customer as c')
    .join('pet as p','c.username','p.owner_username')
    .where('c.username', keyword)
    .orWhere('c.cccd', keyword)
    .select('p.pet_id','p.name');
}

export async function getPetHistory(pet_id){
  const pet = await db('pet').where('pet_id',pet_id).first();

  const examinations = await db('medical_examination')
    .where('pet_id',pet_id)
    .orderBy('examination_date','desc');

  const vaccinations = await db('vaccination')
  .join('vaccine_vaccination','vaccination.vaccination_id','vaccine_vaccination.vaccination_id')
  .join('vaccine','vaccine_vaccination.vaccine_id','vaccine.vaccine_id')
  .where('vaccination.pet_id', pet_id)
  .select(
    'vaccination.vaccination_date',
    'vaccine.vaccine_name',
    'vaccination.dosage'   // ← chỉ rõ bảng
  );

    

  const invoices = await db('invoice')
    .whereIn('appointment_id',
      db('appointment').where('pet_id',pet_id).select('appointment_id')
    );

  return { pet, examinations, vaccinations, invoices };
}
