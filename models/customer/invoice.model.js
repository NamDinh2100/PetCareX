import db from '../../config/database.js';

// export async function createInvoice(username, items, payment_method) {
//   return db.transaction(async trx => {

//     // 1. Lấy staff bán hàng hợp lệ
//     const staff = await trx('staff')
//       .whereIn('position', ['Sales Staff', 'Receptionist'])
//       .first();

//     // 2. Lấy khách hàng
//     const customer = await trx('customer').where('username', username).first();

    

//     // 3. Tính tiền từng dòng
//     let total_price = 0;

//     for (const i of items) {
//       const p = await trx('product').where('product_id', i.product_id).first();
//       i.unit_price = p.selling_price;
//       i.line_total = p.selling_price * i.qty;
//       total_price += i.line_total;
//     }

//     // 4. Tính điểm loyalty
//     const loyalty_points_earned = Math.floor(total_price / 50000);

//     // 5. Ghi hóa đơn
//     const [invoice] = await trx('invoice')
//       .insert({
//         username,
//         staff_username: staff.username,
//         total_price,
//         loyalty_points_earned,
//         payment_method,
//         payment_status: 'Paid'
//       })
//       .returning('*');

//     // 6. Ghi chi tiết hóa đơn + trừ kho
//     for (const i of items) {
//       await trx('invoice_product').insert({
//         invoice_id: invoice.invoice_id,
//         product_id: i.product_id,
//         quantity: i.qty,
//         unit_price: i.unit_price,
//         line_total: i.line_total
//       });

//       await trx('product')
//         .where('product_id', i.product_id)
//         .decrement('stock_quantity', i.qty);
//     }

//     // 7. Cộng điểm + cộng chi tiêu năm
//     const newTotal = customer.total_spending_year + total_price;
//     const newPoint = customer.loyalty_points + loyalty_points_earned;

//     let newLevel = customer.membership_level;
//     if (newTotal >= 12000000) newLevel = 'VIP';
//     else if (newTotal >= 5000000) newLevel = 'Friendly';

//     await trx('customer')
//       .where('username', username)
//       .update({
//         total_spending_year: newTotal,
//         loyalty_points: newPoint,
//         membership_level: newLevel
//       });
//   });
// }

// thay trig
// export async function createInvoice(username, items, payment_method) {
//   return db.transaction(async trx => {

//     const staff = await trx('staff')
//       .whereIn('position', ['Sales Staff', 'Receptionist'])
//       .first();

//     const [invoice] = await trx('invoice')
//       .insert({
//         username,
//         staff_username: staff.username,
//         payment_method,
//         payment_status: 'Paid'   // trigger bắt đầu chạy từ đây
//       })
//       .returning('*');

//     // CHỈ insert dòng – KHÔNG TÍNH GÌ HẾT
//     for (const i of items) {
//       await trx('invoice_product').insert({
//         invoice_id: invoice.invoice_id,
//         product_id: i.product_id,
//         quantity: i.qty
//       });
//     }
//   });
// }
export async function createInvoice(username, items, payment_method) {
  return db.transaction(async trx => {

    const staff = await trx('staff')
      .whereIn('position', ['Sales Staff', 'Receptionist'])
      .first();

    // 1. Tạo Pending
    const [invoice] = await trx('invoice').insert({
      username,
      staff_username: staff.username,
      payment_method,
      payment_status: 'Pending'
    }).returning('*');

    // 2. Ghi dòng
    for (const i of items) {
      await trx('invoice_product').insert({
        invoice_id: invoice.invoice_id,
        product_id: i.product_id,
        quantity: i.qty
      });
    }

    // 3. Chuyển sang Paid → KÍCH HOẠT trigger
    await trx('invoice')
      .where('invoice_id', invoice.invoice_id)
      .update({ payment_status: 'Paid' });
  });
}

export function getInvoicesByCustomer(username) {
  return db('invoice as i')
    .join('invoice_product as ip', 'i.invoice_id', 'ip.invoice_id')
    .join('product as p', 'ip.product_id', 'p.product_id')
    .select(
      'i.invoice_id',
      'i.invoice_date',
      'i.total_price',
      'i.loyalty_points_earned',
      'p.product_name',
      'ip.quantity',
      'ip.unit_price',
      'ip.line_total'
    )
    .where('i.username', username)
    .orderBy('i.invoice_date', 'desc');
}
