import db from '../config/database.js';

export function findUserByUsername(username) {
    return db('app_user')
        .where('username', username)
        .first();
}



export function findCustomer(username) {
    return db('customer')
        .where('username', username)
        .first();
}

export function findStaff(username) {
    return db('staff')
        .where('username', username)
        .first();
}

export function getAllStaffs() {
    return db('staff').select();
}

export function getAllCustomers() {
    return db('customer').select();
}

export function getCustomersWithLimit(limit, offset) {
    return db('customer')
        .select()
        .limit(limit)
        .offset(offset);
}

export function getCustomersCount() {
    return db('customer').count('* as total').first();
}


export function findStaffByUserName(username) {
    return db('staff')
        .where('username', username)
        .first();
}

export function addAppUser(entity, trx) {
    const query = db('app_user').insert(entity);
    if (trx) return query.transacting(trx);
    return query;
}

export function addCustomer(entity, trx) {
    const query = db('customer').insert(entity);
    if (trx) return query.transacting(trx);
    return query;
}

export async function registerCustomer(accountData, customerData) {
    return db.transaction(async function (trx) {
        await addAppUser(accountData, trx);
        await addCustomer(customerData, trx);
    });
}