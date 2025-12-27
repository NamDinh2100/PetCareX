import db from '../config/database.js';

export function getPetsByCustomer(username) {
  return db('pet').where('owner_username', username);
}
