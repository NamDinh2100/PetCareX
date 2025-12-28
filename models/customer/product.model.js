import db from '../../config/database.js';

export function getAllProducts(keyword = '') {
  if (keyword) {
    return db('product')
      .whereILike('product_name', `%${keyword}%`)
      .andWhere('stock_quantity', '>', 0);
  }
  return db('product').where('stock_quantity', '>', 0);
}
