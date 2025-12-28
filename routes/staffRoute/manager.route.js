import express from 'express';
import * as userModel from '../../models/user.model.js';
import * as revenueModel from '../../models/revenue.model.js';
import * as staffModel from '../../models/staff.model.js';
import * as appointmentModel from '../../models/appointment.model.js';
import * as branchModel from '../../models/branch.model.js';

const router = express.Router();

router.get('/', async function (req, res) {
    const branch = await branchModel.findBrachById(req.session.authUser.branch_id);
    res.render('vwManager/dashboard', { 
        branch,
        layout: 'manager' 
    });
});

router.get('/customers', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const customers = await userModel.getCustomersWithLimit(limit, offset); 
    const total = await userModel.getCustomersCount();
    const totalPages = Math.ceil(total.total / limit);
    
    res.render('vwManager/customer', { 
        customers,
        currentPage: page,
        totalPages,
        total: total.total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        layout: 'manager'
    });
});

router.get('/staffs', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const staffs = await staffModel.getStaffsWithLimit(limit, offset, req.session.authUser.branch_id);
    const total = await staffModel.getStaffsCountByBranch(req.session.authUser.branch_id);
    const totalPages = Math.ceil(total.total / limit);

    console.log(total);
    console.log(totalPages);
    
    res.render('vwManager/staff', { 
        staffs,
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

router.get('/appointments', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const appointments = await appointmentModel.getAppointmentsWithLimit(limit, offset);
    const total = await appointmentModel.getAppointmentsCount();
    const totalPages = Math.ceil(total.total / limit);
    
    // Count by status
    const scheduled = appointments.filter(a => a.status === 'Scheduled').length;
    const completed = appointments.filter(a => a.status === 'Completed').length;
    const cancelled = appointments.filter(a => a.status === 'Cancelled').length;
    
    res.render('vwManager/appointment', { 
        appointments,
        currentPage: page,
        totalPages,
        total: total.total,
        scheduled,
        completed,
        cancelled,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        layout: 'manager'
    });
});


export default router;
