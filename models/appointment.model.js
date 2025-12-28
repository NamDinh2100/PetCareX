import db from '../config/database.js';

/* 1. Thú cưng của khách */
export function getPets(username) {
  return db('pet').where('owner_username', username);
}

/* 1.1. Tìm kiếm thú cưng theo tên và loại */
export async function searchPetByName(petName, species) {
  try {
    let query = db('pet as p')
      .leftJoin('users as u', 'p.owner_username', 'u.username')
      .select(
        'p.pet_id',
        'p.pet_name',
        'p.species',
        'p.breed',
        'p.date_of_birth',
        'p.owner_username',
        'u.full_name as owner_name',
        'u.phone_number',
        'u.email'
      )
      .where('p.pet_name', 'like', `%${petName}%`);
    
    if (species) {
      query = query.where('p.species', species);
    }
    
    return await query;
  } catch (error) {
    console.error('Error searching pet:', error);
    // Return demo data
    return getDemoPets().filter(pet => 
      pet.pet_name.toLowerCase().includes(petName.toLowerCase()) &&
      (!species || pet.species === species)
    );
  }
}

/* 1.2. Demo pets data */
function getDemoPets() {
  return [
    {
      pet_id: 1,
      pet_name: 'Milo',
      species: 'Chó',
      breed: 'Golden Retriever',
      date_of_birth: '2020-05-15',
      owner_username: 'customer001',
      owner_name: 'Nguyễn Văn A',
      phone_number: '0901234567',
      email: 'nguyenvana@email.com'
    },
    {
      pet_id: 2,
      pet_name: 'Luna',
      species: 'Mèo',
      breed: 'Anh lông ngắn',
      date_of_birth: '2021-03-20',
      owner_username: 'customer002',
      owner_name: 'Trần Thị B',
      phone_number: '0902345678',
      email: 'tranthib@email.com'
    },
    {
      pet_id: 3,
      pet_name: 'Max',
      species: 'Chó',
      breed: 'Husky',
      date_of_birth: '2019-08-10',
      owner_username: 'customer003',
      owner_name: 'Lê Văn C',
      phone_number: '0903456789',
      email: 'levanc@email.com'
    },
    {
      pet_id: 4,
      pet_name: 'Bella',
      species: 'Mèo',
      breed: 'Ba Tư',
      date_of_birth: '2020-11-25',
      owner_username: 'customer004',
      owner_name: 'Phạm Thị D',
      phone_number: '0904567890',
      email: 'phamthid@email.com'
    },
    {
      pet_id: 5,
      pet_name: 'Charlie',
      species: 'Chó',
      breed: 'Corgi',
      date_of_birth: '2021-06-15',
      owner_username: 'customer005',
      owner_name: 'Hoàng Văn E',
      phone_number: '0905678901',
      email: 'hoangvane@email.com'
    }
  ];
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
        'p.name as pet_name',
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
    console.error('Error fetching appointment:', error);
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

/* 11. Demo data */
function getDemoAppointments() {
  return [
    {
      appointment_id: 1,
      appointment_date: '2024-12-30',
      appointment_time: '09:00',
      status: 'Scheduled',
      pet_name: 'Milo',
      species: 'Chó',
      customer_name: 'Nguyễn Văn A',
      phone_number: '0901234567',
      branch_name: 'Chi nhánh Quận 1'
    },
    {
      appointment_id: 2,
      appointment_date: '2024-12-30',
      appointment_time: '10:30',
      status: 'Scheduled',
      pet_name: 'Luna',
      species: 'Mèo',
      customer_name: 'Trần Thị B',
      phone_number: '0902345678',
      branch_name: 'Chi nhánh Quận 2'
    },
    {
      appointment_id: 3,
      appointment_date: '2024-12-29',
      appointment_time: '14:00',
      status: 'Completed',
      pet_name: 'Max',
      species: 'Chó',
      customer_name: 'Lê Văn C',
      phone_number: '0903456789',
      branch_name: 'Chi nhánh Quận 1'
    },
    {
      appointment_id: 4,
      appointment_date: '2024-12-29',
      appointment_time: '15:30',
      status: 'Completed',
      pet_name: 'Bella',
      species: 'Mèo',
      customer_name: 'Phạm Thị D',
      phone_number: '0904567890',
      branch_name: 'Chi nhánh Quận 3'
    },
    {
      appointment_id: 5,
      appointment_date: '2024-12-28',
      appointment_time: '11:00',
      status: 'Cancelled',
      pet_name: 'Charlie',
      species: 'Chó',
      customer_name: 'Hoàng Văn E',
      phone_number: '0905678901',
      branch_name: 'Chi nhánh Quận 1'
    },
    {
      appointment_id: 6,
      appointment_date: '2024-12-31',
      appointment_time: '09:30',
      status: 'Scheduled',
      pet_name: 'Simba',
      species: 'Mèo',
      customer_name: 'Đặng Thị F',
      phone_number: '0906789012',
      branch_name: 'Chi nhánh Quận 2'
    },
    {
      appointment_id: 7,
      appointment_date: '2024-12-31',
      appointment_time: '13:00',
      status: 'Scheduled',
      pet_name: 'Rocky',
      species: 'Chó',
      customer_name: 'Vũ Văn G',
      phone_number: '0907890123',
      branch_name: 'Chi nhánh Quận 4'
    },
    {
      appointment_id: 8,
      appointment_date: '2024-12-27',
      appointment_time: '10:00',
      status: 'Completed',
      pet_name: 'Kitty',
      species: 'Mèo',
      customer_name: 'Bùi Thị H',
      phone_number: '0908901234',
      branch_name: 'Chi nhánh Quận 1'
    },
    {
      appointment_id: 9,
      appointment_date: '2024-12-31',
      appointment_time: '16:00',
      status: 'Scheduled',
      pet_name: 'Buddy',
      species: 'Chó',
      customer_name: 'Ngô Văn I',
      phone_number: '0909012345',
      branch_name: 'Chi nhánh Quận 3'
    },
    {
      appointment_id: 10,
      appointment_date: '2024-12-26',
      appointment_time: '14:30',
      status: 'Completed',
      pet_name: 'Coco',
      species: 'Mèo',
      customer_name: 'Lý Thị K',
      phone_number: '0910123456',
      branch_name: 'Chi nhánh Quận 2'
    },
    {
      appointment_id: 11,
      appointment_date: '2025-01-02',
      appointment_time: '09:00',
      status: 'Scheduled',
      pet_name: 'Tiger',
      species: 'Chó',
      customer_name: 'Cao Văn L',
      phone_number: '0911234567',
      branch_name: 'Chi nhánh Quận 1'
    },
    {
      appointment_id: 12,
      appointment_date: '2025-01-02',
      appointment_time: '11:30',
      status: 'Scheduled',
      pet_name: 'Whiskers',
      species: 'Mèo',
      customer_name: 'Đỗ Thị M',
      phone_number: '0912345678',
      branch_name: 'Chi nhánh Quận 5'
    }
  ];
}
