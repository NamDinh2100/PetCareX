import express from 'express';
import * as appointmentModel from '../../models/appointment.model.js';
import * as invoiceModel from '../../models/invoice.model.js';
import * as staffModel from '../../models/staff.model.js';

const router = express.Router();

// Dashboard
router.get('/', function (req, res) {
    res.render('vwReceptionist/dashboard', { 
        layout: 'receptionist',
        todayAppointments: 8,
        pendingAppointments: 3,
        completedToday: 5
    });
});

// Danh sách lịch hẹn
router.get('/appointments', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Lấy branch_id từ session của nhân viên
    const branchId = req.session.branch?.branch_id || null;
    
    // Lấy filter status từ query params
    const statusFilter = req.query.status || null;
    
    // Receptionist không quản lý các lịch hẹn đã Completed hoặc Cancelled
    const excludeStatuses = ['Completed', 'Cancelled', 'Need re-exam'];
    
    // Lấy dữ liệu từ model với filter
    const appointments = await appointmentModel.getAppointmentsWithLimit(limit, offset, branchId, statusFilter, excludeStatuses);
    const total = await appointmentModel.getAppointmentsCount(branchId, statusFilter, excludeStatuses);
    
    const totalPages = Math.ceil(total.total / limit);
    
    // Count by status (chỉ đếm các trạng thái đang hoạt động)
    const scheduled = appointments.filter(a => a.status === 'Scheduled').length;

    console.log('Appointments:', appointments[0]);
    
    res.render('vwReceptionist/appointments', { 
        appointments,
        currentPage: page,
        totalPages,
        total: total.total,
        scheduled,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        statusFilter,
        success: req.query.success,
        error: req.query.error,
        layout: 'receptionist'
    });
});

// Trang đặt lịch hẹn
router.get('/create-appointment', function (req, res) {
    res.render('vwReceptionist/create-appointment', { 
        layout: 'receptionist'
    });
});

// API tìm kiếm thú cưng
router.get('/api/search-pet', async function (req, res) {
    const { name, species } = req.query;
    
    if (!name) {
        return res.json({ success: false, message: 'Vui lòng nhập tên thú cưng' });
    }
    
    try {
        const pets = await appointmentModel.searchPetByName(name, species);
        res.json({ success: true, pets });
    } catch (error) {
        console.error('Error searching pet:', error);
        res.json({ success: false, message: 'Có lỗi xảy ra khi tìm kiếm' });
    }
});

// Danh sách hóa đơn chưa có người nhận
router.get('/invoice', async function (req, res) {
    const branchId = req.session.branch?.branch_id || null;
    const staffUsername = req.session.authUser?.username || null;
    
    try {
        // Lấy hóa đơn chưa có người xử lý (của chi nhánh)
        const pendingInvoices = await invoiceModel.getInvoicesNotCompleted(branchId);
        
        // Lấy hóa đơn mà nhân viên này đang xử lý
        const myInvoices = await invoiceModel.getInvoicesByStaff(staffUsername, branchId);
        
        res.render('vwReceptionist/invoice', {
            pendingInvoices,
            myInvoices,
            layout: 'receptionist'
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.render('vwReceptionist/invoice', {
            pendingInvoices: [],
            myInvoices: [],
            error: 'Có lỗi khi tải danh sách hóa đơn',
            layout: 'receptionist'
        });
    }
});

// Nhận hóa đơn để xử lý
router.post('/invoices/:id/assign', async function (req, res) {
    const invoiceId = req.params.id;
    const staffUsername = req.session.authUser?.username;
    
    if (!staffUsername) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    
    try {
        await invoiceModel.assignInvoiceToStaff(invoiceId, staffUsername);
        res.json({ success: true, message: 'Đã nhận hóa đơn thành công' });
    } catch (error) {
        console.error('Error assigning invoice:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
});

// Cập nhật trạng thái thanh toán
router.post('/invoices/:id/payment', async function (req, res) {
    const invoiceId = req.params.id;
    const { status } = req.body;
    
    try {
        await invoiceModel.updatePaymentStatus(invoiceId, status);
        res.json({ success: true, message: 'Đã cập nhật trạng thái thanh toán' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
});

// Xử lý tạo lịch hẹn
router.post('/create-appointment', async function (req, res) {
    const { petId, username, appointmentDate, appointmentTime, branchId, serviceId, notes } = req.body;
    
    try {
        // Tạo lịch hẹn
        const appointmentData = {
            date: appointmentDate,
            time: appointmentTime,
            petId,
            branchId,
            username
        };
        
        const appointmentId = await appointmentModel.createAppointment(appointmentData);
        
        // Thêm dịch vụ
        if (serviceId) {
            await appointmentModel.addServices(appointmentId, [serviceId]);
        }
        
        res.redirect('/receptionist/appointments?success=true');
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.redirect('/receptionist/create-appointment?error=true');
    }
});

// Trang chỉnh sửa lịch hẹn
router.get('/appointments/:id/edit', async function (req, res) {
    const appointmentId = req.params.id;
    const branchId = req.session.branch?.branch_id || null;
    
    try {
        // Lấy thông tin lịch hẹn
        const appointment = await appointmentModel.getAppointmentById(appointmentId);
        
        if (!appointment) {
            return res.redirect('/receptionist/appointments?error=not_found');
        }
        
        // Lấy danh sách bác sĩ thuộc chi nhánh
        const doctors = await staffModel.getDoctorsByBranch(branchId);
        
        res.render('vwReceptionist/edit-appointment', {
            layout: 'receptionist',
            appointment,
            doctors
        });
    } catch (error) {
        console.error('Error fetching appointment for edit:', error);
        res.redirect('/receptionist/appointments?error=true');
    }
});

// Xử lý cập nhật lịch hẹn
router.post('/appointments/:id/edit', async function (req, res) {
    const appointmentId = req.params.id;
    const { appointment_date, appointment_time, staff_username, status } = req.body;
    
    try {
        const updateData = {
            appointment_date,
            appointment_time,
            staff_username: staff_username || null,
            status
        };
        
        await appointmentModel.updateAppointment(appointmentId, updateData);
        res.redirect('/receptionist/appointments?success=updated');
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.redirect(`/receptionist/appointments/${appointmentId}/edit?error=true`);
    }
});

export default router;
