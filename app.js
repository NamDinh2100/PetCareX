import express from 'express';
import session from 'express-session';
import { engine } from 'express-handlebars';
import expressHandlebarsSections from 'express-handlebars-sections';
import appointmentRoute from './routes/appointment.route.js';

import accountRoute from './routes/shareRoute/account.route.js';

// STAFF ROUTES
import doctorRoute from './routes/staffRoute/doctor.route.js';
import receptionistRoute from './routes/staffRoute/receptionist.route.js';
import salerRoute from './routes/staffRoute/seler.route.js';
import managerRoute from './routes/staffRoute/manager.route.js';
// MANAGER ROUTES


import { isAuth, isManager, isDoctor, isReceptionist, isSaler} from './middlewares/auth.mdw.js';

const app = express();

/* ================= BODY PARSER ================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// THÊM DÒNG NÀY: Để dùng được file css/js/img trong thư mục static (nếu có)
app.use(express.static('static')); 

/* ================= SESSION ================= */
app.use(
  session({
    secret: 'petcarex',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // (Tuỳ chọn) Session sống 1 ngày
  })
);

/* ================= HANDLEBARS CONFIGURATION ================= */
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main', 
    helpers: {
        eq(a, b) {
            return a === b;
        },
        json: (context) => JSON.stringify(context),

        formatDate(date) {
            return new Date(date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        },

        formatCurrency(amount) {
            if (!amount) return '0';
            return new Intl.NumberFormat('vi-VN').format(amount);
        },

        formatNumber(num) {
            if (!num) return '0';
            return new Intl.NumberFormat('vi-VN').format(num);
        },

        formatDecimal(num, places) {
            if (!num) return '0';
            return parseFloat(num).toFixed(places || 2);
        },

        substring(str, start, length) {
            if (!str) return '';
            return str.substring(start, start + length);
        },

        multiply(a, b) {
            return (a || 0) * (b || 0);
        },
        math (op, a, b) {
            a = parseFloat(a);
            b = parseFloat(b);
            switch (op) {
                case '+': return a + b;
                case '-': return a - b;
                case '*': return a * b;
                case '/': return a / b;
                case '%': return a % b;
                default: return null;
            }
        },

        section: expressHandlebarsSections()
    }
}));
app.set('view engine', 'hbs');
app.set('views', './views');

/* ================= GLOBAL VARIABLES ================= */
app.use((req, res, next) => {
  res.locals.authUser = req.session.authUser || null;
  res.locals.isAuth = req.session.isAuth || false;
  next();
});

// ACCOUNT ROUTE
app.use('/', accountRoute);


// STAFF ROUTE
app.use('/doctor', isAuth, isDoctor, doctorRoute);
app.use('/receptionist', isAuth, isReceptionist, receptionistRoute);
app.use('/saler', isAuth, isSaler, salerRoute);
app.use('/manager', isAuth, isManager, managerRoute);

// CUSTOMER ROUTE

/* ================= SERVER ================= */
app.listen(3000, () => {
  console.log('PetCareX running at http://localhost:3000');
});