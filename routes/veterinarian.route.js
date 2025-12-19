import express from 'express';
import * as appointmentService from '../models/appointment.model.js';
import * as prescriptionService from '../models/prescription.model.js';
import * as petService from '../models/pet.model.js';

const router = express.Router();

router.get('/schedule', async function (req, res) {
    res.render('vwVeterinarian/schedule',
        { layout: 'vet-layout' }
    )
});

router.get('/appointment', async function (req, res) {
    const schedule = await appointmentService.getSchedule(req.session.authUser.user_id);
    //const medicines = await prescriptionService.getAllMedicines();
    res.render('vwVeterinarian/appointment', { schedule, layout: 'vet-layout' });
});

router.post('/appointment/prescription', async function (req, res) {
    
    const medicines = req.body.medicine_id;
    
    const record = {
        appointment_id: req.body.appointment_id,
        pet_id: req.body.pet_id,
        veterinarian_id: req.session.authUser.user_id,
        symptoms: req.body.symptoms,
        treatment: req.body.treatment,
        diagnosis: req.body.diagnosis,
        instruction: req.body.instruction
    };

    console.log(record);
    const record_id = await prescriptionService.addMedicalRecord(record);
    const prescription_id = await prescriptionService.addPrescription(record_id);

    for (const medicine_id of medicines) {
        await prescriptionService.addMedicineForPrescription({
            prescription_id: prescription_id,
            medicine_id: medicine_id
        });
    }

    await appointmentService.updateAppointmentStatus(req.body.appointment_id, 'completed');

    res.redirect('/vet/appointment');
});

router.get('/appointment/pet-info', async function (req, res) {
    const appointment_id = req.query.appointment_id;
    const customer_id = req.query.customer_id;
    const pet_id = req.query.pet_id;
    let pet = null;
    if (pet_id) 
        pet = await petService.getPetByID(pet_id);

    res.render('vwVeterinarian/petInfo', {
        pet: pet,
        customer_id: customer_id,
        appointment_id: appointment_id,
        layout: 'vet-layout'
    });

});

router.post('/appointment/pet-info', async function (req, res) {
    const pet_id = req.query.pet_id;
    const updatedPet = {
        pet_name: req.body.pet_name,
        species: req.body.species,
        sex: req.body.sex,
        weight: req.body.weight,
        notes: req.body.notes
    };
    await petService.updatePetInfo(pet_id, updatedPet);
    res.redirect('/vet/appointment');
});

router.post('/appointment/pet-info/add', async function (req, res) {
    const newPet = {
        owner_id: req.body.owner_id,
        name: req.body.name,
        species: req.body.species,
        sex: req.body.sex,
        day_born: req.body.dob,
        weight: req.body.weight,
        notes: req.body.notes
    };

    const pet_id = await petService.addPet(newPet);
    await appointmentService.updateAppointmentPet(req.body.appointment_id, pet_id[0].pet_id);

    res.redirect('/vet/appointment');
});

router.get('/appointment/pet-info/medical-history', async function (req, res) {
    const pet_id = req.query.pet_id;
    const medicalHistory = await appointmentService.getMedicalHistoryByPetID(pet_id);
    res.render('vwVeterinarian/medicalHistory', {
        medicalHistory: medicalHistory,
        layout: 'vet-layout'
    });
});

export default router;