import db from '../config/database.js';

// Lấy danh sách hóa đơn chưa có người xử lý (theo chi nhánh nếu có)
export async function getInvoicesNotCompleted(branchId = null) {
    let query = db('invoice as i')
        .leftJoin('appointment as a', 'i.appointment_id', 'a.appointment_id')
        .leftJoin('pet as p', 'a.pet_id', 'p.pet_id')
        .leftJoin('customer as c', 'a.username', 'c.username')
        .leftJoin('branch as b', 'a.branch_id', 'b.branch_id')
        .select(
            'i.invoice_id',
            'i.appointment_id',
            'i.total_price',
            'i.payment_status',
            'i.invoice_date',
            'i.staff_username',
            'p.name as pet_name',
            'c.full_name as customer_name',
            'c.phone_number',
            'b.branch_name',
            'b.branch_id'
        )
        .whereNull('i.staff_username')
        .orderBy('i.invoice_date', 'asc');
    
    if (branchId) {
        query = query.where('a.branch_id', branchId);
    }
    
    return await query;
}

// Nhân viên nhận hóa đơn để xử lý
export function assignInvoiceToStaff(invoiceId, staffUsername) {
    return db('invoice')
        .where('invoice_id', invoiceId)
        .update({
            staff_username: staffUsername,
        });
}

// Lấy danh sách hóa đơn đã được nhân viên nhận (của chính nhân viên đó)
export async function getInvoicesByStaff(staffUsername, branchId = null) {
    let query = db('invoice as i')
        .leftJoin('appointment as a', 'i.appointment_id', 'a.appointment_id')
        .leftJoin('pet as p', 'a.pet_id', 'p.pet_id')
        .leftJoin('customer as c', 'a.username', 'c.username')
        .leftJoin('branch as b', 'a.branch_id', 'b.branch_id')
        .select(
            'i.invoice_id',
            'i.appointment_id',
            'i.total_price',
            'i.payment_status',
            'i.invoice_date',
            //'i.updated_at',
            'p.name as pet_name',
            'c.full_name as customer_name',
            'c.phone_number',
            'b.branch_name'
        )
        .where('i.staff_username', staffUsername)
    
    if (branchId) {
        query = query.where('a.branch_id', branchId);
    }
    
    return await query;
}

// Cập nhật trạng thái thanh toán
export function updatePaymentStatus(invoiceId, status) {
    return db('invoice')
        .where('invoice_id', invoiceId)
        .update({
            payment_status: status,
        });
}