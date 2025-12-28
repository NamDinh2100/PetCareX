// import express from 'express';
// import * as customerModel from '../models/customer.model.js';

// const router = express.Router();

// // Middleware: chỉ cho CUSTOMER vào
// // router.use((req, res, next) => {
// //     if (!req.session.authUser || req.session.authUser.role !== 'CUSTOMER') {
// //         return res.redirect('/auth/login');
// //     }
// //     next();
// // });

// // Trang dashboard khách hàng
// router.get('/home', async (req, res) => {
//     const pets = await customerModel.getPetsByCustomer(req.session.authUser.username);
//     res.render('customer/home', { pets });
// });

// import * as productModel from '../models/product.model.js';
// import * as invoiceModel from '../models/invoice.model.js';

// // XEM SẢN PHẨM
// router.get('/customer/products', async (req, res) => {
//     const keyword = req.query.keyword || '';
//     const products = await productModel.getAllProducts(keyword);
//     res.render('customer/products', { products, keyword });
// });
// import * as doctorModel from '../models/doctor.model.js';



// // Xem lịch bác sĩ
// router.get('/customer/doctors', async (req, res) => {
//   const doctorList = await doctorModel.getAllDoctors();
//   const doctor = req.query.doctor || '';
//   const doctors = await doctorModel.getDoctorSchedules(doctor);

//   res.render('customer/doctors', {
//     doctors,
//     doctorList,
//     selectedDoctor: doctor
//   });
// });
// // CHECKOUT
// router.post('/customer/checkout', async (req, res) => {
//     const items = [];

//     for (const key in req.body) {
//         if (key.startsWith('qty_') && req.body[key] > 0) {
//             items.push({
//                 product_id: key.replace('qty_', ''),
//                 qty: parseInt(req.body[key])
//             });
//         }
//     }

//     if (items.length === 0) return res.redirect('/customer/products');

//     const payment_method = req.body.payment_method;

//     await invoiceModel.createInvoice(req.session.authUser.username, items, payment_method);
//     res.redirect('/customer/invoices');
// });

// router.get('/customer/invoices', async (req, res) => {
//     const invoices = await invoiceModel.getInvoicesByCustomer(req.session.authUser.username);
//     res.render('customer/invoices', { invoices });
// });


// import * as apptModel from '../models/appointment.model.js';

// // 2. Mở form đặt lịch
// router.get('/customer/appointment', async (req, res) => {
//     const branches = await apptModel.getBranches();
//     const pets = await apptModel.getPetsByCustomer(req.session.authUser.username);
//     res.render('customer/appointment', { branches, pets });
// });

// // 3–4. Load dịch vụ theo chi nhánh
// router.get('/customer/branch/:id/services', async (req, res) => {
//     const services = await apptModel.getServicesByBranch(req.params.id);
//     res.json(services);
// });


// // 6–9. Đặt lịch
// router.post('/customer/appointment', async (req, res) => {
//   const { pet_id, branch_id, date, time } = req.body;
//   const services = JSON.parse(req.body.services);

//   const branches = await apptModel.getBranches();
//   const pets = await apptModel.getPetsByCustomer(req.session.authUser.username);

//   const ok = await apptModel.isTimeAvailable(branch_id, date, time);
//   if (!ok) {
//     return res.render('customer/appointment', {
//       branches,
//       pets,
//       error: ' Khung giờ đã có người đặt!'
//     });
//   }

//   await apptModel.createAppointmentWithServices({
//     pet_id,
//     branch_id,
//     appointment_date: date,
//     appointment_time: time,
//     username: req.session.authUser.username
//   }, services);

//   res.render('customer/appointment', {
//     branches,
//     pets,
//     success: ' Đặt lịch thành công!'
//   });
// });



// import * as medicalModel from '../models/medical.model.js';
// router.get('/customer/pet/:id/history', async (req, res) => {
//   const history = await medicalModel.getPetMedicalHistory(req.params.id);
//   res.render('customer/pet-history', { history });
// });


// export default router;
import express from 'express';

import * as petModel from '../models/customer/pet.model.js';
import * as productModel from '../models/customer/product.model.js';
import * as invoiceModel from '../models/customer/invoice.model.js';
import * as apptModel from '../models/customer/appointment.model.js';
import * as doctorApptModel from '../models/doctor/appointment.model.js';
import * as medicalModel from '../models/doctor/exam.model.js';

const router = express.Router();

/* ================= MIDDLEWARE CUSTOMER ================= */
// router.use((req,res,next)=>{
//   if (!req.session.authUser || req.session.authUser.role !== 'CUSTOMER') {
//     return res.redirect('/auth/login');
//   }
//   next();
// });

/* ================= DASHBOARD ================= */
router.get('/customer/home', async (req, res) => {
  const pets = await petModel.getPetsByCustomer(req.session.authUser.username);
  res.render('customer/home', { pets });
});

/* ================= SẢN PHẨM ================= */
router.get('/customer/products', async (req, res) => {
  const keyword = req.query.keyword || '';
  const products = await productModel.getAllProducts(keyword);
  res.render('customer/products', { products, keyword });
});

/* ================= MUA HÀNG ================= */
router.post('/customer/checkout', async (req, res) => {
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

router.get('/customer/invoices', async (req, res) => {
  const invoices = await invoiceModel.getInvoicesByCustomer(req.session.authUser.username);
  res.render('customer/invoices', { invoices });
});
//------------------XEM LỊCH 
import * as doctorScheduleModel from '../models/customer/doctor-schedule.model.js';

router.get('/customer/doctor-schedule', async (req, res) => {
  const doctorList = await doctorScheduleModel.getAllDoctors();
  const doctor = req.query.doctor || '';
  const doctors = await doctorScheduleModel.getDoctorSchedules(doctor);

  res.render('customer/doctor-schedule', {
    doctors,
    doctorList,
    selectedDoctor: doctor
  });
});


/* ================= ĐẶT LỊCH ================= */
router.get('/customer/appointment', async (req, res) => {
  const branches = await apptModel.getBranches();
  const pets = await apptModel.getPetsByCustomer(req.session.authUser.username);
  res.render('customer/appointment', { branches, pets });
});


router.get('/customer/branch/:id/services', async (req, res) => {
  const services = await apptModel.getServicesByBranch(req.params.id);
  res.json(services);
});

router.get('/customer/branch/:id/doctors', async (req,res)=>{
  const doctors = await apptModel.getDoctorsByBranch(req.params.id);
  res.json(doctors);
});
router.post('/customer/appointment', async (req, res) => {
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

    res.render('customer/appointment', {
      branches,
      pets,
      success: '🎉 Đặt lịch thành công!'
    });

  } catch (err) {
    res.render('customer/appointment', {
      branches,
      pets,
      error: err.message
    });
  }
});

//====================HẠNG THÀNH VIÊN
import * as loyaltyModel from '../models/customer/loyalty.model.js';

router.get('/customer/loyalty', async (req, res) => {
  const info = await loyaltyModel.getCustomerLoyalty(req.session.authUser.username);
  res.render('customer/loyalty', { info });
});

/* ================= LỊCH BÁC SĨ ================= */
router.get('/customer/doctors', async (req, res) => {
  const list = await doctorApptModel.getMyAppointments();
  res.render('customer/doctors', { list });
});

/* ================= HỒ SƠ PET ================= */
router.get('/customer/pet/:id/history', async (req, res) => {
  const history = await medicalModel.getPetMedicalHistory(req.params.id);
  res.render('customer/pet-history', { history });
});


import * as historyModel from '../models/customer/pet-history.model.js';

// Màn hình nhập username / CCCD
router.get('/customer/pet-history', (req,res)=>{
  res.render('customer/pet-history-search');
});

// Tìm thú cưng của khách hàng
router.post('/customer/pet-history/search', async (req,res)=>{
  const { keyword } = req.body; // username hoặc CCCD

  const pets = await historyModel.findPetsByCustomerKeyword(keyword);
  res.render('customer/pet-history-list', { pets, keyword });
});

// Xem lịch sử thú cưng

router.get('/customer/pet-history/:pet_id', async (req,res)=>{
  const pet_id = req.params.pet_id;
  const data = await historyModel.getPetHistory(pet_id);
  res.render('customer/pet-history-detail', data);
});


export default router;
