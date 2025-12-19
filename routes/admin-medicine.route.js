import express from 'express';
import * as medicineService from '../models/medicine.model.js';

const router = express.Router();

router.get('/', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;

    const total = await medicineService.countByMedicine();

    const nPages = Math.ceil(+total.count / limit);
    const pageNumbers = [];

    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === +page,
        });
    }

    const list = await medicineService.findPageByMedicine(limit, offset);

    res.render('vwAdmin/vwMedicine/list', { 
        medicines: list,
        isAddMode: false,
        pageNumbers: pageNumbers,
        layout: 'admin-layout'
    });
});

router.get('/add', function (req, res) {
    res.render('vwAdmin/vwMedicine/list', { 
        isAddMode: true,
        layout: 'admin-layout'
    });
});

router.post('/add', async function (req, res) {
    const medicine = {
        medicine_name: req.body.medicine_name,
        form: req.body.form,
        category: req.body.category,
        description: req.body.description,
    };
    await medicineService.addMedicine(medicine);
    res.redirect('/admin/medicines');
});

router.get('/edit', async function (req, res) {
    const id = req.query.id;
    const medicine = await medicineService.getMedicineByID(id);
    res.render('vwAdmin/vwMedicine/edit', { 
        medicine: medicine,
        layout: 'admin-layout'
    });
});

router.post('/edit', async function (req, res) {
    const id = req.query.id;
    const medicine = {
        medicine_name: req.body.medicine_name,
        form: req.body.form,
        category: req.body.category,
        description: req.body.description,
    };
    await medicineService.updateMedicine(id, medicine);
    res.redirect('/admin/medicines');
});

export default router;