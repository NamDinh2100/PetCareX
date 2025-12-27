import express from 'express';
import * as authModel from '../models/auth.model.js';

const router = express.Router();

// 1. GET: Hiển thị trang Login
router.get('/login', (req, res) => {
  // SỬA: Dùng layout 'main' để có giao diện đẹp
  res.render('auth/login', { layout: 'main' });
});

// 2. POST: Xử lý đăng nhập
router.post('/login', async (req, res) => {
  console.log('LOGIN BODY:', req.body);

  const { username, password } = req.body;

  const user = await authModel.findUserByUsername(username);

  // Kiểm tra đăng nhập thất bại
  if (!user || user.password !== password) {
    return res.render('auth/login', {
      layout: 'main', // SỬA: Khi báo lỗi vẫn phải giữ giao diện đẹp
      error: 'Sai username hoặc password'
    });
  }

  // --- XỬ LÝ PHÂN QUYỀN & SESSION ---
  
  // Kiểm tra xem có phải nhân viên (Bác sĩ) không
  const staff = await authModel.findStaff(username);

  if (staff) {
    // Lưu thông tin đầy đủ vào session để main.hbs hiển thị
    req.session.authUser = {
      username: staff.username,
      full_name: staff.full_name,
      role: staff.position // VD: 'Doctor'
    };

    if (staff.position === 'Doctor') {
      return res.redirect('/doctor/home');
    }
  } else {
    // Nếu không phải staff -> Là Customer
    // (Bạn nên viết thêm hàm findCustomer để lấy tên thật, ở đây mình tạm gán)
    req.session.authUser = {
      username: username,
      full_name: username, // Tạm lấy username làm tên hiển thị
      role: 'CUSTOMER'
    };
    return res.redirect('/home');
  }

  // Fallback mặc định
  res.redirect('/home');
});

// 3. LOGOUT
router.get('/logout', (req, res) => {
  // Xóa sessionauth
  req.session.destroy(() => res.redirect('/auth/login'));
});

export default router;