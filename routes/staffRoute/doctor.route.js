import express from 'express';
import * as doctorModel from '../../models/doctor.model.js';

const router = express.Router();

router.get('/', function (req, res) {
    res.render('vwDoctor/home');
});

router.get('/doctor/appointments', async (req, res) => {
  const list = await model.getAppointmentsForDoctorToday(req.session.username);

  console.log('===== DOCTOR APPOINTMENTS =====');
  console.log(list);
  console.log('===============================');

  res.render('doctor/appointments', { list });
});

/* MÀN HÌNH KHÁM */
router.get('/doctor/appointments/:id/examine', async (req, res) => {
  const appt = await model.getAppointmentDetail(req.params.id);
  const history = await model.getMedicalHistory(appt.pet_id);
  const vaccinations = await model.getVaccinationHistory(appt.pet_id);
  const medicines = await model.getMedicines();

  res.render('doctor/examine', {
    appt,
    history,
    vaccinations,
    medicines,
    packages: []   // hiện chưa có gói → để trống an toàn
  });
});

/* LƯU KHÁM */
router.post('/doctor/appointments/:id/examine', async (req, res) => {
  const {
    petId,
    symptoms,
    diagnosis,
    reExamDate,
    medicineId,
    quantity,
    dosage,
    note
  } = req.body;

  const examId = await model.createMedicalExam({
    petId,
    appointmentId: req.params.id,
    doctor: req.session.username,
    symptoms,
    diagnosis,
    reExamDate: reExamDate || null
  });

  if (medicineId) {
    const prescriptionId = await model.createPrescription(examId);
    await model.addPrescriptionItem({
      prescriptionId,
      medicineId,
      quantity,
      dosage,
      note
    });
  }

  const status = reExamDate ? 'Need re-exam' : 'Completed';
  await model.updateAppointmentStatus(req.params.id, status);

  res.redirect('/doctor/appointments');
});

export default router;
