import express from 'express';
import * as model from '../models/appointment.model.js';

const router = express.Router();

/* FORM ĐẶT LỊCH */
router.get('/appointment', async (req, res) => {
  if (!req.session.username) return res.redirect('/auth/login');

  res.render('appointment/create', {
    pets: await model.getPets(req.session.username),
    branches: await model.getBranches()
  });
});

/* AJAX: dịch vụ theo chi nhánh */
router.get('/appointment/services', async (req, res) => {
  const services = await model.getServicesByBranch(req.query.branchId);
  res.json(services);
});

/* SUBMIT ĐẶT LỊCH */
router.post('/appointment', async (req, res) => {
  const { petId, branchId, serviceIds, date, time } = req.body;

  if (!petId || !branchId || !serviceIds || !date || !time) {
    return res.send('Thiếu thông tin bắt buộc');
  }

  const ok = await model.isSlotAvailable(branchId, date, time);
  if (!ok) {
    return res.send('Khung giờ đã được đặt');
  }

  const appointmentId = await model.createAppointment({
    petId,
    branchId,
    date,
    time,
    username: req.session.username
  });

  await model.addServices(
    appointmentId,
    Array.isArray(serviceIds) ? serviceIds : [serviceIds]
  );

  res.send('Đặt lịch thành công');
});

export default router;
