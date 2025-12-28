import db from '../config/database.js';

export function getRevenueByDoctor() {
    return db('staff as s')
        .innerJoin('appointment as a', 's.username', 'a.staff_username')
        .innerJoin('invoice as i', 'a.appointment_id', 'i.appointment_id')
        .select(
            's.full_name as doctor_name',
            's.username as doctor_username',
            db.raw('COUNT(DISTINCT i.invoice_id) as total_invoices'),
            db.raw('SUM(i.total_price - i.discount) as total_revenue'),
            db.raw('AVG(i.total_price - i.discount) as avg_revenue_per_invoice'),
            db.raw('COUNT(DISTINCT a.pet_id) as total_pets_treated')
        )
        .where('s.position', 'Doctor')
        .andWhere('i.payment_status', 'Paid')
        .andWhere('i.invoice_date', '>=', '2024-01-01')
        .groupBy('s.username', 's.full_name')
        .orderBy('total_revenue', 'desc');
};

export function getInvoice() {
    return db('invoice').select();
}

export async function getRevenueByMonth(year = 2024) {
    try {
        // Demo data doanh thu theo tháng cho demo
        const demoData = [
            { month: 1, total_revenue: 180000000, total_invoices: 145, avg_revenue: 1241379 },
            { month: 2, total_revenue: 195000000, total_invoices: 158, avg_revenue: 1234177 },
            { month: 3, total_revenue: 220000000, total_invoices: 172, avg_revenue: 1279070 },
            { month: 4, total_revenue: 240000000, total_invoices: 189, avg_revenue: 1269841 },
            { month: 5, total_revenue: 280000000, total_invoices: 210, avg_revenue: 1333333 },
            { month: 6, total_revenue: 260000000, total_invoices: 198, avg_revenue: 1313131 },
            { month: 7, total_revenue: 290000000, total_invoices: 225, avg_revenue: 1288889 },
            { month: 8, total_revenue: 310000000, total_invoices: 240, avg_revenue: 1291667 },
            { month: 9, total_revenue: 285000000, total_invoices: 218, avg_revenue: 1307339 },
            { month: 10, total_revenue: 320000000, total_invoices: 245, avg_revenue: 1306122 },
            { month: 11, total_revenue: 340000000, total_invoices: 265, avg_revenue: 1283019 },
            { month: 12, total_revenue: 360000000, total_invoices: 280, avg_revenue: 1285714 }
        ];
        
        return demoData;
    } catch (error) {
        console.log('getRevenueByMonth error:', error);
        return [];
    }
}

// Thống kê doanh thu theo quý
export async function getRevenueByQuarter(year = 2024) {
    try {
        const monthlyData = await getRevenueByMonth(year);
        const quarterData = [];
        
        for (let q = 1; q <= 4; q++) {
            const startMonth = (q - 1) * 3 + 1;
            const endMonth = q * 3;
            
            const quarterRevenue = monthlyData
                .filter(m => m.month >= startMonth && m.month <= endMonth)
                .reduce((sum, m) => sum + m.total_revenue, 0);
                
            const quarterInvoices = monthlyData
                .filter(m => m.month >= startMonth && m.month <= endMonth)
                .reduce((sum, m) => sum + m.total_invoices, 0);
            
            quarterData.push({
                quarter: q,
                total_revenue: quarterRevenue,
                total_invoices: quarterInvoices,
                avg_revenue: quarterRevenue / quarterInvoices || 0
            });
        }
        
        return quarterData;
    } catch (error) {
        console.log('getRevenueByQuarter error:', error);
        return [];
    }
}

// Top 5 tháng có doanh thu cao nhất
export async function getTopRevenueMonths(year = 2024, limit = 5) {
    try {
        const monthlyData = await getRevenueByMonth(year);
        const monthNames = [
            '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        
        return monthlyData
            .sort((a, b) => b.total_revenue - a.total_revenue)
            .slice(0, limit)
            .map(m => ({
                ...m,
                month_name: monthNames[m.month],
                growth_rate: Math.random() * 20 - 5 // Giả lập tỷ lệ tăng trưởng
            }));
    } catch (error) {
        console.log('getTopRevenueMonths error:', error);
        return [];
    }
}

export function getYearlyRevenueSummary(year = 2024) {
    return {
        total_revenue: 3200000000,
        growth_rate: 12.5 // Giả lập tỷ lệ tăng trưởng
    };
}
