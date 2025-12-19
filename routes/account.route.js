import express from 'express';
import bcrypt from 'bcryptjs';
import * as userService from '../models/user.model.js';
import * as serviceService from '../models/service.model.js';
import * as appointmentService from '../models/appointment.model.js';
import * as medicineService from '../models/medicine.model.js';
import * as emailService from '../models/email.model.js';

const router = express.Router();

router.get('/', function (req, res) {
    res.render('vwAccounts/home');
});

router.get('/signup', function (req, res) {
    res.render('vwAccounts/signup');
});

router.post('/signup', async function (req, res) {
    const hashPassword = bcrypt.hashSync(req.body.password);
    const user = {
        full_name: req.body.full_name,
        password: hashPassword,
        phone: req.body.phone,
        email: req.body.email,
        role: 'owner',
        status: 'active'
    }
    
    await userService.addUser(user);
    res.redirect('/');
});

router.get('/signin', function (req, res) {
    res.render('vwAccounts/signin')
})

router.post('/signin', async function (req, res) {
    const email = req.body.email;
    const user = await userService.getUserByEmail(email);

    if (!user)
    {
        return res.render('vwAccounts/signin', {
            err_message: 'Invalid email or password'
        });
    }

    const password = req.body.password;
    const ret = bcrypt.compareSync(password, user.password);

    if (ret == false)
    {
        return res.render('vwAccounts/signin', {
            err_message: 'Invalid email or password'
        });
    }

    const serviceList = await serviceService.getAllServices();

    req.session.isAuth = true;
    req.session.authUser = user;
    req.session.serviceList = serviceList;

    console.log('User logged in:', req.session.authUser);

    let url;
    if (user.role !== 'owner')
    {
        const medicines = await medicineService.getAllMedicines();
        req.session.medicines = medicines;

        if (user.role === 'admin') {
            url = '/admin/customers';
        }

        else if (user.role === 'veterinarian') {
            url = '/vet/schedule';
            const schedule = await appointmentService.getSchedule(user.user_id);
            req.session.schedule = schedule;
        }
    }

    else
    {
        url = '/';
        const pets = await userService.getPetByID(user.user_id);
        req.session.pets = pets;
    }
        
    const retUrl = req.session.retUrl || url;
    delete req.session.retUrl;
    res.redirect(retUrl);
});

router.post('/signout', function (req, res) {
    req.session.isAuth = false;
    delete req.session.authUser;
    res.redirect('/');
});

router.get('/forgot-password', function (req, res) {
    res.render('vwAccounts/forgot-password');
});

router.post('/forgot-password', async function (req, res) {
    const email = req.body.email;
    const user = await userService.getUserByEmail(email);

    if (!user) {
        return res.render('vwAccounts/forgot-password', {
            err_message: 'Email not found'
        });
    }

    const genPassword = emailService.generatePassword();
    console.log('Generated password:', genPassword);
    try {
        const emailText = `Dear, ${req.body.full_name}!
            \nThis is your new password: ${genPassword}

            \nPlease change your password after your first login.`;
        await emailService.sendEmail(req.body.email, 'Welcome to WEDSITE', emailText);
    } catch (error) {
        console.error('Error sending email:', error);
    }

    const hashPassword = bcrypt.hashSync(genPassword);
    await userService.updatePassword(user.user_id, hashPassword);
    res.render('vwAccounts/signin', {
        success_message: 'A new password has been sent to your email.'
    });
});



export default router;
