// import db from '../config/database.js';
import db from '../../config/database.js';

export function searchMedicine(keyword = '') {
  return db('medicine')
    .whereILike('medicine_name', `%${keyword}%`);
}
