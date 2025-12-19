import express from 'express';
import * as appointmentService from '../models/appointment.model.js';
import * as userService from '../models/user.model.js';
import * as serviceService from '../models/service.model.js';

const router = express.Router();

router.get('/', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;

    const total = await appointmentService.countByAppointment();

    const nPages = Math.ceil(+total.count / limit);
    const pageNumbers = [];

    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === +page,
        });
    }

    const list = await appointmentService.findPageByAppointment(limit, offset);

    res.render('vwAdmin/vwAppointment/list', { 
        appointments: list,
        pageNumbers: pageNumbers,
        layout: 'admin-layout'
    });
});

router.get('/edit', async function (req, res) {
    const id = req.query.id;
    const appointment = await appointmentService.getAppointmentByID(id);
    const vetList = await userService.getAllVeterinarians();

    const serviceList = await serviceService.getServiceByAppointmentID(id);
    res.render('vwAdmin/vwAppointment/edit', {
        appointment: appointment,
        vet: vetList,
        service: serviceList,
        layout: 'admin-layout'
    });
});

router.post('/edit', async function (req, res) {
    const id = req.query.id;
    const updatedAppointment = {
        veterinarian_id: +req.body.veterinarian,
        status: 'confirmed'
    };

    await appointmentService.updateAppointment(id, updatedAppointment);
    res.redirect('/admin/appointments');
});

router.get('/view', async function (req, res) {
    const id = req.query.id;
    const appointment = await appointmentService.getAppointmentByID(id);
    const serviceList = await serviceService.getServiceByAppointmentID(id);

    res.render('vwAdmin/vwAppointment/view', {
        appointment: appointment,
        service: serviceList,
        layout: 'admin-layout'
    });
});

export default router;