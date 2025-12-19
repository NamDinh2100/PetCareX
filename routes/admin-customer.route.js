import express from 'express';
import * as userService from '../models/user.model.js';

const router = express.Router();

router.get('/', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;

    const total = await userService.countByCustomer();

    const nPages = Math.ceil(+total.count / limit);
    const pageNumbers = [];

    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === +page,
        });
    }

    const list = await userService.findPageByCustomer(limit, offset);

    res.render('vwAdmin/vwCustomer/list', { 
        customers: list,
        isAddMode: false,
        pageNumbers: pageNumbers,
        layout: 'admin-layout'
    });
});

router.get('/edit', async function (req, res) {
    const id = req.query.id;
    const customer = await userService.getUserByID(id);
    res.render('vwAdmin/vwCustomer/edit', { 
        customer: customer,
        layout: 'admin-layout'
    });
});

router.get('/delete', async function (req, res) {
    const id = req.query.id;
    await userService.deleteUser(id);
    res.redirect('/admin/customers');
});


export default router;
