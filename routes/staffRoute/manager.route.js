import express from 'express';
import * as userModel from '../../models/user.model.js';

const router = express.Router();

router.get('/', function (req, res) {
    res.render('vwManager/dashboard', { 
        layout: 'manager' 
    });
});

router.get('/customers', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const customers = await userModel.getCustomersWithLimit(limit, offset);
    const countResult = await userModel.getCustomersCount();
    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);
    
    res.render('vwManager/customer', { 
        customers,
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        layout: 'manager'
    });
});

router.get('/staffs', async function (req, res) {
    const list = await userModel.getAllStaffs();
    res.render('vwManager/staff', { 
        staffs: list,
        layout: 'manager'
    });
});

router.get('/revenue', function (req, res) {

    res.render('vwManager/revenue', { 
        layout: 'manager' 
    });
});

export default router;
