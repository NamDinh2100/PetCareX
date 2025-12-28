import express from 'express';

import * as doctorApptModel from '../models/doctor/appointment.model.js';
import * as examModel from '../models/doctor/exam.model.js';
import * as prescriptionModel from '../models/doctor/prescription.model.js';
import * as medicineModel from '../models/doctor/medicine.model.js';

//port * as vaccModel from '../models/doctor/vaccination.model.js';

const router = express.Router();


/* ================== HOME ================== */
router.get('/doctor/home', async (req, res) => {
  const today = req.query.today;
  const appts = today
    ? await doctorApptModel.getTodayAppointmentsByDoctor(req.session.authUser.username)
    : await doctorApptModel.getMyAppointments(req.session.authUser.username);

  res.render('doctor/home', { appts, today });
});

/* ================== HỒ SƠ PET ================== */

router.get('/doctor/pet/:id/history', async (req, res) => {
  const history = await examModel.getPetHistory(req.params.id);
  const packages = await examModel.getPetVaccinationPackages(req.params.id);

  res.render('doctor/pet-history', {
    history,
    packages
  });
});

/* ================== TRA CỨU THUỐC ================== */
router.get('/doctor/medicine', async (req, res) => {
  const list = await medicineModel.searchMedicine(req.query.keyword || '');
  res.render('doctor/medicine', { list });
});

/* ================== FORM TẠO BỆNH ÁN ================== */
router.get('/doctor/exam', (req, res) => {
  res.render('doctor/exam', {
    appointment_id: req.query.appointment_id,
    pet_id: req.query.pet_id
  });
});

/* ================== TẠO BỆNH ÁN ================== */
router.post('/doctor/exam', async (req, res) => {
  const exam = await examModel.createMedicalExam({
    pet_id: req.body.pet_id,
    appointment_id: req.body.appointment_id,
    staff_username: req.session.authUser.username,
    symptoms: req.body.symptoms,
    diagnosis: req.body.diagnosis,
    re_examination_date: req.body.re_exam || null
  });
  
  res.redirect(`/doctor/exam/${exam.examination_id}/prescribe`);
});

/* ================== FORM KÊ TOA ================== */
router.get('/doctor/exam/:exam_id/prescribe', async (req, res) => {
  const meds = await medicineModel.searchMedicine();
  res.render('doctor/prescribe', { meds, exam_id: req.params.exam_id });
});

/* ================== KÊ TOA ================== */
router.post('/doctor/exam/:exam_id/prescribe', async (req, res) => {
  const items = JSON.parse(req.body.items || '[]');
  await prescriptionModel.createPrescription(req.params.exam_id, items);
  res.redirect('/doctor/home');
});

// /* ================== TIÊM PHÒNG ================== */
import * as vaccModel from '../models/doctor/vaccination.model.js';

// 1) Trang chọn thú cưng để tiêm theo gói
router.get('/doctor/vaccination', async (req, res) => {
  const pet_id = req.query.pet_id || null;

  const pets = await vaccModel.getPetsWithPackages();
  const packages = pet_id ? await vaccModel.getPetPackages(pet_id) : [];
  const petProfile = pet_id ? await vaccModel.getPetProfile(pet_id) : null;

  res.render('doctor/vaccination', { pets, packages, pet_id, petProfile });
});

// 2) Chọn 1 gói → hiện danh sách vaccine (mũi) trong gói
router.get('/doctor/vaccination/package/:package_id', async (req, res) => {
  const package_id = req.params.package_id;
  const pet_id = req.query.pet_id;

  const dueVaccines = await vaccModel.getDueVaccines(package_id);

  res.render('doctor/vaccination-detail', {
    package_id,
    pet_id,
    dueVaccines
  });
});

// 3) Xác nhận tiêm 1 mũi
router.post('/doctor/vaccination/confirm', async (req, res) => {
  const { pet_id, package_id, vaccine_id, dosage, vaccination_date } = req.body;

  try {
    await vaccModel.recordVaccination({
      pet_id: parseInt(pet_id),
      staff_username: req.session.authUser.username,
      vaccination_date: vaccination_date || new Date(), // có thể gửi từ form
      vaccine_id: parseInt(vaccine_id),
      dosage
    });

    // quay lại trang danh sách mũi của gói
    res.redirect(`/doctor/vaccination/package/${package_id}?pet_id=${pet_id}`);

  } catch (err) {
    // Lỗi do trigger ném ra → show cho bác sĩ
    const dueVaccines = await vaccModel.getDueVaccines(package_id);

    res.render('doctor/vaccination-detail', {
      package_id,
      pet_id,
      dueVaccines,
      error: err.message
    });
  }
});


export default router;
