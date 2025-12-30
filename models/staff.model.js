import db from '../config/database.js';

export function getStaffsWithLimit(limit, offset, branch_id) {
    return db('staff as s')
        .join('branch as b', 's.branch_id', 'b.branch_id')
        .where('b.branch_id', branch_id)
        .select('s.*', 'b.branch_name')
        .limit(limit)
        .offset(offset);
}

export function getStaffsCountByBranch(branch_id) {
    return db('staff')
        .where('branch_id', branch_id)
        .count('* as total')
        .first();
}

export function findDoctorByBranch(branch_id) {
    return db('staff')
        .where({
            branch_id: branch_id,
            position: 'Doctor'
        })
        .select('*');
}

export function getDoctorsByBranch(branch_id) {
    return db('staff')
        .where({
            branch_id: branch_id,
            position: 'Doctor'
        })
        .select('username', 'full_name');
}