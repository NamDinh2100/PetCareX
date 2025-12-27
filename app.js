import express from 'express';
import session from 'express-session';
import { engine } from 'express-handlebars';

import authRoute from './routes/auth.route.js';
import appointmentRoute from './routes/appointment.route.js';
import doctorRoute from './routes/doctor.route.js';

import customerRoute from './routes/customer.route.js';

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
        eq: (a, b) => a === b,
        json: (context) => JSON.stringify(context)
    }
}));
app.set('view engine', 'hbs');
app.set('views', './views');

/* ================= GLOBAL VARIABLES ================= */
app.use((req, res, next) => {
  // Biến này sẽ được dùng ở main.hbs
  res.locals.authUser = req.session.authUser || null;
  next();
});

/* ================= ROUTES ================= */
app.use('/auth', authRoute);

app.use('/', customerRoute); 

app.use('/appointment', appointmentRoute);
app.use('/', doctorRoute);

app.get('/', (req, res) => {
  if (!req.session.authUser) {
    return res.redirect('/auth/login');
  }
  if (req.session.authUser.role === 'Doctor') {
    return res.redirect('/doctor/home');
  }

  res.redirect('/auth/login');
});

/* ================= SERVER ================= */
app.listen(3000, () => {
  console.log('PetCareX running at http://localhost:3000');
});