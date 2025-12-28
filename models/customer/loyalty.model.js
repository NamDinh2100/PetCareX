import db from '../../config/database.js';

export function getCustomerLoyalty(username) {
  return db('customer')
    .select('loyalty_points', 'membership_level', 'total_spending_year')
    .where('username', username)
    .first();
}
