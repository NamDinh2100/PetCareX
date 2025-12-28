import express from 'express';
import * as userModel from '../../models/user.model.js';

const router = express.Router();

router.get('/', function (req, res) {
    res.render('vwAccounts/home');
});

router.get('/signin', function (req, res) {
    res.render('vwAccounts/signin');
});

router.get('/signup', function (req, res) {
    res.render('vwAccount/signup');
});

router.post('/signin', async function (req, res) {
    const { username, password } = req.body;

    const user = await userModel.findUserByUsername(username);

    if (!user || user.password !== password) {
        return res.render('vwAccounts/signin', {
            error: 'Sai username hoặc password'
        });
    }

    const staff = await userModel.findStaffByUserName(user.username);
    
    req.session.isAuth = true;
    let url = '/';

    if (staff) {
        if (staff.position === 'Branch Manager') 
            url = '/manager';
        else if (staff.position === 'Receptionist') 
            url = '/receptionist';
        else if (staff.position === 'Doctor') 
            url = '/doctor';
        else if (staff.position === 'Sales Staff') 
            url = '/saler';
        
        req.session.authUser = staff;
    }

    else if (customer) {
        const customer = await userModel.findCustomerByUserId(user.id);
        req.session.authUser = customer;
    }

    const retUrl = req.session.retUrl || url;
    delete req.session.retUrl;
    res.redirect(retUrl);
});

router.post('/signup', function (req, res) {
    // Xử lý đăng ký ở đây
    res.send('Đăng ký thành công');
});

router.post('/signout', function (req, res) {
    req.session.isAuth = false;
    delete req.session.authUser;
    res.redirect('/');
});



export default router;