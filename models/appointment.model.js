import db from '../config/database.js';

/* 1. Thú cưng của khách */
export function getPets(username) {
  return db('pet').where('owner_username', username);
}

/* 1.1. Tìm kiếm thú cưng theo tên và loại */
export async function searchPetByName(petName, species) {
  try {
    let query = db('pet as p')
      .leftJoin('customer as c', 'p.owner_username', 'c.username')
      .select(
        'p.pet_id',
        'p.name',
        'p.species',
        'p.day_born',
        'p.owner_username',
        'c.full_name as owner_name',
        'c.phone_number',
        'c.email'
      )
      .where('p.name', 'like', `%${petName}%`);
    
    if (species) {
      query = query.where('p.species', species);
    }
    
    return await query;
  } catch (error) {
    console.error('Error searching pet:', error);
    // Return demo data
    return getDemoPets().filter(pet => 
      pet.name.toLowerCase().includes(petName.toLowerCase()) &&
      (!species || pet.species === species)
    );
  }
}

/* 2. Chi nhánh */
export function getBranches() {
  return db('branch');
}

/* 3. Dịch vụ theo chi nhánh (branch_service) */
export function getServicesByBranch(branchId) {
  return db('service as s')
    .join('branch_service as bs', 's.service_id', 'bs.service_id')
    .where('bs.branch_id', branchId)
    .select('s.service_id', 's.service_name', 's.base_price');
}

/* 4. Kiểm tra khung giờ */
export async function isSlotAvailable(branchId, date, time) {
  const row = await db('appointment')
    .where({
      branch_id: branchId,
      appointment_date: date,
      appointment_time: time
    })
    .first();

  return !row;
}

/* 5. Tạo lịch hẹn */
export async function createAppointment(data) {
  const [appointment] = await db('appointment')
    .insert({
      appointment_date: data.date,
      appointment_time: data.time,
      status: 'Scheduled',
      pet_id: data.petId,
      branch_id: data.branchId,
      username: data.username
    })
    .returning('appointment_id');

  return appointment.appointment_id;
}

/* 6. Gán nhiều dịch vụ cho lịch */
export function addServices(appointmentId, serviceIds) {
  const rows = serviceIds.map(sid => ({
    appointment_id: appointmentId,
    service_id: sid
  }));

  return db('appointment_service').insert(rows);
}

/* 7. Lấy danh sách lịch hẹn với phân trang */
export async function getAppointmentsWithLimit(limit, offset, branchId, statusFilter = null, excludeStatuses = null) {
  try {
    let query = db('appointment as a')
      .leftJoin('pet as p', 'a.pet_id', 'p.pet_id')
      .leftJoin('customer as c', 'a.username', 'c.username')
      .leftJoin('branch as b', 'a.branch_id', 'b.branch_id')
      .select(
        'a.appointment_id',
        'a.appointment_date',
        'a.appointment_time',
        'a.status',
        'p.name',
        'p.species',
        'c.full_name as customer_name',
        'c.phone_number',
        'b.branch_name'
      )
      .orderBy('a.appointment_date', 'desc')
      .orderBy('a.appointment_time', 'desc');
    
    if (branchId) {
      query = query.where('a.branch_id', branchId);
    }
    
    if (statusFilter) {
      query = query.where('a.status', statusFilter);
    }
    
    // Loại bỏ các status không mong muốn (ví dụ: Completed, Cancelled)
    if (excludeStatuses && excludeStatuses.length > 0) {
      query = query.whereNotIn('a.status', excludeStatuses);
    }
    
    return await query.limit(limit).offset(offset);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return getDemoAppointments().slice(offset, offset + limit);
  }
}

/* 8. Đếm tổng số lịch hẹn */
export async function getAppointmentsCount(branchId = null, statusFilter = null, excludeStatuses = null) {
  try {
    let query = db('appointment');
    
    if (branchId) {
      query = query.where('branch_id', branchId);
    }
    
    if (statusFilter) {
      query = query.where('status', statusFilter);
    }
    
    // Loại bỏ các status không mong muốn
    if (excludeStatuses && excludeStatuses.length > 0) {
      query = query.whereNotIn('status', excludeStatuses);
    }
    
    const result = await query.count('* as total').first();
    return result;
  } catch (error) {
    console.error('Error counting appointments:', error);
    return { total: getDemoAppointments().length };
  }
}

/* 9. Lấy chi tiết appointment */
export async function getAppointmentById(appointmentId) {
  try {
    const appointment = await db('appointment as a')
      .leftJoin('pet as p', 'a.pet_id', 'p.pet_id')
      .leftJoin('customer as c', 'a.username', 'c.username')
      .leftJoin('branch as b', 'a.branch_id', 'b.branch_id')
      .leftJoin('staff as s', 'a.staff_username', 's.username')
      .where('a.appointment_id', appointmentId)
      .select(
        'a.appointment_id',
        'a.appointment_date',
        'a.appointment_time',
        'a.status',
        'a.pet_id',
        'a.branch_id',
        'a.staff_username',
        'p.name',
        'p.species',
        'c.full_name as customer_name',
        'c.phone_number',
        'c.username as customer_username',
        'b.branch_name',
        's.full_name as doctor_name'
      )
      .first();
    
    return appointment;
  } catch (error) {
    console.error('Error fetching appointment 1:', error);
    return getDemoAppointments().find(a => a.appointment_id == appointmentId);
  }
}

/* 10. Update appointment */
export async function updateAppointment(appointmentId, appointmentData) {
  try {
    await db('appointment')
      .where('appointment_id', appointmentId)
      .update(appointmentData);
    return true;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
}
