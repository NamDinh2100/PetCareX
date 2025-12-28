import db from '../../config/database.js';

/** 1) Danh sách thú cưng có đăng ký gói (để chọn) */
export function getPetsWithPackages() {
  return db('pet as p')
    .join('pet_vaccination_package as pvp', 'p.pet_id', 'pvp.pet_id')
    .select('p.pet_id', 'p.name')
    .groupBy('p.pet_id', 'p.name')
    .orderBy('p.name');
}

/** 2) Gói tiêm của 1 thú cưng */
export function getPetPackages(pet_id) {
  return db('pet_vaccination_package as pvp')
    .join('vaccination_package as vp', 'pvp.package_id', 'vp.package_id')
    .where('pvp.pet_id', pet_id)
    .select(
      'pvp.pet_id',
      'pvp.package_id',
      'vp.package_name',
      'pvp.start_date',
      'pvp.end_date',
      'pvp.status',
      'vp.discount_percentage'
    )
    .orderBy('pvp.start_date', 'desc');
}

/**
 * 3) Danh sách vaccine thuộc gói (mức tối thiểu).
 * Nếu bạn có bảng cấu hình gói (vd: package_vaccine), thì join vào đó.
 * Ở đây mình giả định có: package_vaccine(package_id, vaccine_id, dose_no, due_after_days)
 */
export function getDueVaccines(package_id) {
  return db('package_vaccine as pv')
    .join('vaccine as v', 'pv.vaccine_id', 'v.vaccine_id')
    .where('pv.package_id', package_id)
    .select(
      'pv.package_id',
      'pv.vaccine_id',
      'pv.dose_order',      // ← ĐÚNG
      'pv.interval_days',
      'pv.required',
      'v.vaccine_name'
    )
    .orderBy('pv.dose_order', 'asc');        // ← ĐÚNG
}



/**
 * 4) Ghi nhận 1 lượt tiêm
 * - Insert vaccination (header)
 * - Insert vaccine_vaccination (detail)
 * Trigger DB sẽ:
 *  - check Doctor được tiêm (trg_ValidateVaccination)
 *  - check vaccine chưa hết hạn (trg_ValidateVaccineExpiry)
 */
export async function recordVaccination({ pet_id, staff_username, vaccination_date, dosage, vaccine_id }) {
  return db.transaction(async trx => {
    const [vacc] = await trx('vaccination')
      .insert({
        pet_id,
        staff_username,
        vaccination_date,
        dosage: dosage || null
      })
      .returning('*');

    await trx('vaccine_vaccination').insert({
      vaccination_id: vacc.vaccination_id,
      vaccine_id
    });

    return vacc;
  });
}

export function getPetProfile(pet_id) {
  return db('pet as p')
    .join('customer as c', 'p.owner_username', 'c.username')
    .where('p.pet_id', pet_id)
    .select(
      'p.pet_id',
      'p.name as pet_name',
      'p.species',
      'p.sex',
      'p.day_born',
      'p.weight',
      'p.health_status',
      'c.full_name as owner_name',
      'c.phone_number as owner_phone'
    )
    .first();
}