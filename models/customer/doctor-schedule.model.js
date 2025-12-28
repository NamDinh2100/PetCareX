import db from '../../config/database.js';

/* Danh sách bác sĩ để dropdown */
export function getAllDoctors() {
  return db('staff')
    .where('position', 'Doctor')
    .select('username', 'full_name');
}

/* Lịch làm việc bác sĩ (cho khách xem) */
export function getDoctorSchedules(doctor = '') {
  let q = db('appointment as a')
    .join('staff as s','a.staff_username','s.username')
    .join('branch as b','a.branch_id','b.branch_id')
    .where('s.position','Doctor')
    .where('a.appointment_date','>=', db.raw('CURRENT_DATE'));

  if (doctor) q = q.where('s.username', doctor);

  return q.select(
    's.full_name',
    'b.branch_name',
    'a.appointment_date',
    'a.appointment_time',
    'a.status'
  )
  .orderBy('a.appointment_date')
  .orderBy('a.appointment_time');
}
