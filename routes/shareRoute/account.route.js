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
    res.render('vwAccounts/signup');
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

router.post('/signup', async function (req, res) {
    const { username, email, password, name, phone, gender, dob } = req.body;

    const existUser = await userModel.findUserByUsername(username);
    if (existUser) {
        return res.render('vwAccount/signup', {
            error: 'Tên đăng nhập đã tồn tại!'
        });
    }

    const accountData = {
        username: username,
        password: password
    };

    let genderCode = 'M';
    if (gender === 'Nữ') genderCode = 'F';

    const customerData = {
        username: username, 
        full_name: name,
        email: email,
        phone_number: phone,
        gender: genderCode,
        date_of_birth: dob, 
        membership_level: 'Basic',
    };

    try {
        await userModel.registerCustomer(accountData, customerData);
        res.redirect('/signin?success=true');
        
    } catch (err) {
        console.error("Lỗi đăng ký:", err);
        res.render('vwAccount/signup', {
            error: 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.'
        });
    }
});

router.post('/signout', function (req, res) {
    req.session.isAuth = false;
    delete req.session.authUser;
    res.redirect('/');
});



export default router;