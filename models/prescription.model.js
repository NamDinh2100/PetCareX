import db from '../config/database.js';

export async function addMedicalRecord(record) {
    const result = await db('medical_records')
        .insert(record)
        .returning('record_id');      
    
    const row = result[0];
    return typeof row === 'object' ? row.record_id : row;
}

export async function addPrescription(record_id) {
    const result = await db('prescription')
        .insert({ record_id: record_id })
        .returning('prescription_id');
    const row = result[0];
    return typeof row === 'object' ? row.prescription_id : row;
}

export function addMedicineForPrescription(prescriptionMedicine) {
    return db('prescription_medicine').insert(prescriptionMedicine);
}