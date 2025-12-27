import db from '../config/database.js';

/* =====================================================
   1. LỊCH HẸN HÔM NAY CỦA BÁC SĨ
   - Chỉ lấy lịch hôm nay
   - Trạng thái: Scheduled / Confirmed / Need re-exam
===================================================== */
export function getAppointmentsForDoctorToday(username) {
  return db('appointment as a')
    .join('pet as p', 'a.pet_id', 'p.pet_id')
    .where('a.staff_username', username)
    .whereIn('a.status', ['Scheduled', 'Confirmed', 'Need re-exam'])
    .where('a.appointment_date', db.raw('CURRENT_DATE'))
    .select(
      'a.appointment_id',
      'a.appointment_date',
      'a.appointment_time',
      'a.status',
      'p.name as pet_name'
    )
    .orderBy('a.appointment_time');
}

/* =====================================================
   2. CHI TIẾT LỊCH HẸN
===================================================== */
export function getAppointmentDetail(id) {
  return db('appointment as a')
    .join('pet as p', 'a.pet_id', 'p.pet_id')
    .where('a.appointment_id', id)
    .select(
      'a.appointment_id',
      'a.pet_id',
      'p.name as pet_name',
      'a.appointment_date',
      'a.appointment_time'
    )
    .first();
}

/* =====================================================
   3. TIỀN SỬ KHÁM BỆNH
===================================================== */
export function getMedicalHistory(petId) {
  return db('medical_examination')
    .where('pet_id', petId)
    .select(
      'examination_date',
      'diagnosis'
    )
    .orderBy('examination_date', 'desc');
}

/* =====================================================
   4. LỊCH SỬ TIÊM PHÒNG (TIÊM LẺ)
===================================================== */
export function getVaccinationHistory(petId) {
  return db('vaccination as v')
    .join('vaccine_vaccination as vv', 'v.vaccination_id', 'vv.vaccination_id')
    .join('vaccine as vc', 'vv.vaccine_id', 'vc.vaccine_id')
    .where('v.pet_id', petId)
    .select(
      'v.vaccination_date',
      'vc.vaccine_name',
      'vc.vaccine_type',
      'v.dosage'
    )
    .orderBy('v.vaccination_date', 'desc');
}

/* =====================================================
   5. GÓI TIÊM PHÒNG CỦA THÚ CƯNG
===================================================== */
export function getVaccinePackages(petId) {
  return db('pet_vaccination_package as pvp')
    .join('vaccination_package as vp', 'pvp.package_id', 'vp.package_id')
    .where('pvp.pet_id', petId)
    .select(
      'vp.package_name',
      'pvp.start_date',
      'pvp.end_date',
      'pvp.status',
      'pvp.total_price',
      'vp.duration_months',
      'vp.discount_percentage'
    )
    .orderBy('pvp.start_date', 'desc');
}

/* =====================================================
   6. DANH SÁCH THUỐC CÒN TRONG KHO
===================================================== */
export function getMedicines() {
  return db('medicine')
    .where('stock_quantity', '>', 0)
    .select(
      'medicine_id',
      'medicine_name'
    );
}

/* =====================================================
   7. TẠO HỒ SƠ KHÁM BỆNH
===================================================== */
export async function createMedicalExam(data) {
  const [row] = await db('medical_examination')
    .insert({
      pet_id: data.petId,
      appointment_id: data.appointmentId,
      staff_username: data.doctor,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      re_examination_date: data.reExamDate || null
    })
    .returning('examination_id');

  return row.examination_id;
}

/* =====================================================
   8. TẠO ĐƠN THUỐC
===================================================== */
export async function createPrescription(examId) {
  const [row] = await db('prescription')
    .insert({
      examination_id: examId
    })
    .returning('prescription_id');

  return row.prescription_id;
}

/* =====================================================
   9. THÊM THUỐC VÀO ĐƠN
===================================================== */
export function addPrescriptionItem(data) {
  return db('prescription_item').insert({
    prescription_id: data.prescriptionId,
    medicine_id: data.medicineId,
    quantity: data.quantity,
    dosage: data.dosage,
    note: data.note || null
  });
}

/* =====================================================
   10. CẬP NHẬT TRẠNG THÁI LỊCH HẸN
===================================================== */
export function updateAppointmentStatus(id, status) {
  return db('appointment')
    .where('appointment_id', id)
    .update({ status });
}



///BAC SI
export function getAllDoctors() {
  return db('staff')
    .where('position', 'Doctor')
    .select('username', 'full_name');
}

export function getDoctorSchedules(doctor_username = '') {
  let q = db('staff as s')
    .join('history as h', 's.username', 'h.staff_username')
    .join('branch as b', 'h.branch_id', 'b.branch_id')
    .leftJoin('appointment as a', 's.username', 'a.staff_username')
    .where('s.position', 'Doctor');

  if (doctor_username) {
    q = q.where('s.username', doctor_username);
  }

  return q.select(
    's.username',
    's.full_name',
    'b.branch_name',
    'a.appointment_date',
    'a.appointment_time',
    'a.status'
  ).orderBy('s.full_name');
}
