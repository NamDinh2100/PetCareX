

import express from 'express';
import session from 'express-session';
import { engine } from 'express-handlebars';

import authRoute from './routes/auth.route.js';
import doctorRoute from './routes/doctor.route.js';
import customerRoute from './routes/customer.route.js';

const app = express();


/* ================= BODY PARSER ================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('static'));

/* ================= SESSION ================= */
app.use(session({
  secret: 'petcarex',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

/* ================= VIEW ================= */
// app.engine('hbs', engine({
//   extname: '.hbs',
//   defaultLayout: 'main',
//   helpers: {
//     eq: (a,b)=>a===b,
//     json: (c)=>JSON.stringify(c)
//   }
// }));
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    eq: (a,b)=>a===b,
    ifEquals(a, b, options) {
      return String(a) === String(b) ? options.fn(this) : options.inverse(this);
    },
    json: (c)=>JSON.stringify(c)
  }
}));

app.set('view engine','hbs');
app.set('views','./views');

/* ================= GLOBAL ================= */
app.use((req,res,next)=>{
  res.locals.authUser = req.session.authUser || null;
  next();
});

/* ================= ROUTES ================= */
app.use('/auth', authRoute);
app.use('/', customerRoute);
app.use('/', doctorRoute);

/* ================= ROOT ================= */
app.get('/', (req,res)=>{
  if(!req.session.authUser) return res.redirect('/auth/login');
  if(req.session.authUser.role==='Doctor') return res.redirect('/doctor/home');
  return res.redirect('/customer/home');
});

/* ================= START ================= */
app.listen(3000, ()=>console.log('PetCareX running at http://localhost:3000'));
