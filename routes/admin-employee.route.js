import express from 'express';
import bcrypt from 'bcryptjs';
import * as employeeService from '../models/user.model.js';
import * as emailService from '../models/email.model.js';

const router = express.Router();

router.get('/', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;

    const total = await employeeService.countByEmpID();

    const nPages = Math.ceil(+total.count / limit);
    const pageNumbers = [];

    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === +page,
        });
    }

    const list = await employeeService.findPageByEmpID(limit, offset);

    res.render('vwAdmin/vwEmployee/list', {
        employees: list,
        pageNumbers: pageNumbers,
        layout: 'admin-layout'
    });
});

router.get('/add', async function (req, res) {
    res.render('vwAdmin/vwEmployee/add', {
        layout: 'admin-layout'
    });
});

router.post('/add', async function (req, res) {
     
    const genPassword = emailService.generatePassword();
    try {
        const emailText = `Welcome to the our WEDSITE, ${req.body.full_name}!\nYour account has been created with the following credentials:
        \nEmail: ${req.body.email}
        \nPassword: ${genPassword}
        \nRole: ${req.body.role}
        \nPlease change your password after your first login.`;
        await emailService.sendEmail(req.body.email, 'Welcome to WEDSITE', emailText);
    } catch (error) {
        console.error('Error sending email:', error);   
    }

    const hashPassword = bcrypt.hashSync(genPassword);

    const employee = {
        full_name: req.body.full_name,
        password: hashPassword,
        email: req.body.email,
        phone: req.body.phone,
        role: req.body.role,
        status: 'active'
    };

    await employeeService.addEmployee(employee);
    res.redirect('/admin/employees');
});

router.get('/edit', async function (req, res) {
    const id = req.query.id;
    const employee = await employeeService.getEmployeeByID(id);
    res.render('vwAdmin/vwEmployee/edit', {
        employee: employee,
        layout: 'admin-layout'
    });
});

router.post('/edit', async function (req, res) {
    const id = req.query.id;

    const employee = {
        full_name: req.body.full_name,
        email: req.body.email,
        phone: req.body.phone,
        role: req.body.role
    };
    await employeeService.updateEmployee(id, employee);
    res.redirect('/admin/employees');
});

export default router;