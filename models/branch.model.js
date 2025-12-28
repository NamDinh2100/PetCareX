import db from '../config/database.js';

export function getAllBranches() {
    return db('branch').select();
}

export function findBrachById(branchId) {
    return db('branch')
        .where('branch_id', branchId)
        .first();
}