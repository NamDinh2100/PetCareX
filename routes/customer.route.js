import express from 'express';
import * as customerModel from '../models/customer.model.js';

const router = express.Router();

// Middleware: chỉ cho CUSTOMER vào
// router.use((req, res, next) => {
//     if (!req.session.authUser || req.session.authUser.role !== 'CUSTOMER') {
//         return res.redirect('/auth/login');
//     }
//     next();
// });

// Trang dashboard khách hàng
router.get('/home', async (req, res) => {
    const pets = await customerModel.getPetsByCustomer(req.session.authUser.username);
    res.render('customer/home', { pets });
});

import * as productModel from '../models/product.model.js';
import * as invoiceModel from '../models/invoice.model.js';

// XEM SẢN PHẨM
router.get('/customer/products', async (req, res) => {
    const keyword = req.query.keyword || '';
    const products = await productModel.getAllProducts(keyword);
    res.render('customer/products', { products, keyword });
});

// CHECKOUT
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

    const payment_method = req.body.payment_method;

    await invoiceModel.createInvoice(req.session.authUser.username, items, payment_method);
    res.redirect('/customer/invoices');
});

router.get('/customer/invoices', async (req, res) => {
    const invoices = await invoiceModel.getInvoicesByCustomer(req.session.authUser.username);
    res.render('customer/invoices', { invoices });
});


import * as apptModel from '../models/appointment.model.js';

// 2. Mở form đặt lịch
router.get('/customer/appointment', async (req, res) => {
    const branches = await apptModel.getBranches();
    const pets = await apptModel.getPetsByCustomer(req.session.authUser.username);
    res.render('customer/appointment', { branches, pets });
});

// 3–4. Load dịch vụ theo chi nhánh
router.get('/customer/branch/:id/services', async (req, res) => {
    const services = await apptModel.getServicesByBranch(req.params.id);
    res.json(services);
});


// 6–9. Đặt lịch
router.post('/customer/appointment', async (req, res) => {
  const { pet_id, branch_id, date, time } = req.body;
  const services = JSON.parse(req.body.services);

  const branches = await apptModel.getBranches();
  const pets = await apptModel.getPetsByCustomer(req.session.authUser.username);

  const ok = await apptModel.isTimeAvailable(branch_id, date, time);
  if (!ok) {
    return res.render('customer/appointment', {
      branches,
      pets,
      error: ' Khung giờ đã có người đặt!'
    });
  }

  await apptModel.createAppointmentWithServices({
    pet_id,
    branch_id,
    appointment_date: date,
    appointment_time: time,
    username: req.session.authUser.username
  }, services);

  res.render('customer/appointment', {
    branches,
    pets,
    success: ' Đặt lịch thành công!'
  });
});



import * as medicalModel from '../models/medical.model.js';
router.get('/customer/pet/:id/history', async (req, res) => {
  const history = await medicalModel.getPetMedicalHistory(req.params.id);
  res.render('customer/pet-history', { history });
});


export default router;
