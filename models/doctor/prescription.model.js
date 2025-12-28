// import db from '../config/database.js';
import db from '../../config/database.js';

// export async function createPrescription(exam_id, items) {
//   return db.transaction(async trx => {
//     const [p] = await trx('prescription')
//       .insert({ examination_id: exam_id })
//       .returning('*');

//     for (const i of items) {
//       await trx('prescription_item').insert({
//         prescription_id: p.prescription_id,
//         medicine_id: i.medicine_id,
//         quantity: i.qty,
//         dosage: i.dosage
//       });
//     }
//   });
// }
export async function createPrescription(exam_id, items) {
  return db.transaction(async trx => {
    const [p] = await trx('prescription')
      .insert({ examination_id: exam_id })
      .returning('*');

    for (const i of items) {
      await trx('prescription_item').insert({
        prescription_id: p.prescription_id,
        medicine_id: i.medicine_id,
        quantity: i.qty,
        dosage: i.dosage
      });
    }
  });
}