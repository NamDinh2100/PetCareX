import express from 'express'
import * as appointmentService from '../models/appointment.model.js'
import * as petService from '../models/pet.model.js'

const router = express.Router();

router.post('/appointment/book', async function (req, res) {
    try {
        const appointment_id = await appointmentService.addAppointment({
            customer_id: req.session.authUser.user_id,
            pet_id: req.body.pet_id,
            date_start: req.body.date_start,
            time: req.body.time,
            note: req.body.note,
            status: 'scheduled'
        });

        const servicesList = Array.isArray(req.body.services)
            ? req.body.services
            : [req.body.services];

        for (const service_id of servicesList) {
            await appointmentService.addServiceForAppointment({
                appointment_id,
                service_id
            });
        }

        res.redirect('/');
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).render('403', {
            err_message: 'Failed to book appointment. Please try again.'
        });
    }
});


router.get('/my-profile', function (req, res) {
    res.render('vwCustomer/profile', {
        activeTab: 'profile'
    });
})

router.get('/my-pets', async function (req, res) {
    const user = req.session.authUser;
    const list = await petService.getPetByUserID(user.user_id);

    res.render('vwCustomer/profile', {
        activeTab: 'pet',
        pets: list
    })
})

router.get('/my-appointments', function (req, res) {
    res.render('vwCustomer/profile', {
        activeTab: 'appointments'
    });
});

export default router;