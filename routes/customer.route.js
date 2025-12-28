import express from 'express';

import * as petModel from '../models/customer/pet.model.js';
import * as productModel from '../models/customer/product.model.js';
import * as invoiceModel from '../models/customer/invoice.model.js';
import * as apptModel from '../models/customer/appointment.model.js';
import * as doctorApptModel from '../models/doctor/appointment.model.js';
import * as medicalModel from '../models/doctor/exam.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('Customer:', req.session.authUser);
  const pets = await petModel.getPetsByCustomer(req.session.authUser.username);
  res.render('vwCustomer/home', { pets });
});

/* ================= SẢN PHẨM ================= */
router.get('/products', async (req, res) => {
  const keyword = req.query.keyword || '';
  const products = await productModel.getAllProducts(keyword);
  res.render('vwCustomer/products', { products, keyword });
});

/* ================= MUA HÀNG ================= */
router.post('/checkout', async (req, res) => {
  const items = [];

  for (const key in req.body) {
    if (key.startsWith('qty_') && req.body[key] > 0) {
      items.push({
        product_id: key.replace('qty_', ''),
        qty: parseInt(req.body[key])
      });
    }
  }

  if (items.length === 0) return res.redirect('/customer/products');

  await invoiceModel.createInvoice(req.session.authUser.username, items, req.body.payment_method);
  res.redirect('/customer/invoices');
});

router.get('/invoices', async (req, res) => {
  const invoices = await invoiceModel.getInvoicesByCustomer(req.session.authUser.username);
  res.render('vwCustomer/invoices', { invoices });
});
//------------------XEM LỊCH 
import * as doctorScheduleModel from '../models/customer/doctor-schedule.model.js';

router.get('/doctor-schedule', async (req, res) => {
  const doctorList = await doctorScheduleModel.getAllDoctors();
  const doctor = req.query.doctor || '';
  const doctors = await doctorScheduleModel.getDoctorSchedules(doctor);

  res.render('vwCustomer/doctor-schedule', {
    doctors,
    doctorList,
    selectedDoctor: doctor
  });
});


/* ================= ĐẶT LỊCH ================= */
router.get('/appointment', async (req, res) => {
  const branches = await apptModel.getBranches();
  const pets = await apptModel.getPetsByCustomer(req.session.authUser.username);
  res.render('vwCustomer/appointment', { branches, pets });
});


router.get('/branch/:id/services', async (req, res) => {
  const services = await apptModel.getServicesByBranch(req.params.id);
  res.json(services);
});

router.get('/branch/:id/doctors', async (req,res)=>{
  const doctors = await apptModel.getDoctorsByBranch(req.params.id);
  res.json(doctors);
});
router.post('/appointment', async (req, res) => {
  const { pet_id, branch_id, date, time, staff_username } = req.body;
  const services = JSON.parse(req.body.services || '[]');

  const branches = await apptModel.getBranches();
  const pets = await apptModel.getPetsByCustomer(req.session.authUser.username);

  try {
    await apptModel.createAppointmentWithServices({
      pet_id,
      branch_id,
      staff_username: staff_username || null,
      appointment_date: date,
      appointment_time: time,
      username: req.session.authUser.username
    }, services);

    res.render('vwCustomer/appointment', {
      branches,
      pets,
      success: '🎉 Đặt lịch thành công!'
    });

  } catch (err) {
    res.render('vwCustomer/appointment', {
      branches,
      pets,
      error: err.message
    });
  }
});

//====================HẠNG THÀNH VIÊN
import * as loyaltyModel from '../models/customer/loyalty.model.js';

router.get('/loyalty', async (req, res) => {
  const info = await loyaltyModel.getCustomerLoyalty(req.session.authUser.username);
  res.render('vwCustomer/loyalty', { info });
});

/* ================= LỊCH BÁC SĨ ================= */
router.get('/doctors', async (req, res) => {
  const list = await doctorApptModel.getMyAppointments();
  res.render('vwCustomer/doctors', { list });
});

/* ================= HỒ SƠ PET ================= */
router.get('/pet/:id/history', async (req, res) => {
  const history = await medicalModel.getPetMedicalHistory(req.params.id);
  res.render('vwCustomer/pet-history', { history });
});


import * as historyModel from '../models/customer/pet-history.model.js';

// Màn hình nhập username / CCCD
router.get('/pet-history', (req,res)=>{
  res.render('vwCustomer/pet-history-search');
});

// Tìm thú cưng của khách hàng
router.post('/pet-history/search', async (req,res)=>{
  const { keyword } = req.body; // username hoặc CCCD

  const pets = await historyModel.findPetsByCustomerKeyword(keyword);
  res.render('vwCustomer/pet-history-list', { pets, keyword });
});

// Xem lịch sử thú cưng

router.get('/pet-history/:pet_id', async (req,res)=>{
  const pet_id = req.params.pet_id;
  const data = await historyModel.getPetHistory(pet_id);
  res.render('vwCustomer/pet-history-detail', data);
});


export default router;
