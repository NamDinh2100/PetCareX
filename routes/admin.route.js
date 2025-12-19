import express from 'express';
import * as userService from '../models/user.model.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.get('/profile', async function (req, res) { 
    return res.render('vwAdmin/profile', {
        layout: 'admin-layout',
        changePassword: false,
    }); 
}); 

router.post('/profile', async function (req, res) {
    const id = req.session.authUser.user_id;
    const user = {
        full_name: req.body.full_name,
        phone: req.body.phone,
        address: req.body.address,
    };
    await userService.updateUser(id, user);
    const userUpdated = await userService.getUserByID(id);
    req.session.authUser = userUpdated;
    res.redirect('/admin/profile');
});

router.get('/change-password', function (req, res) {
    res.render('', {
        layout: 'admin-layout',
        changePassword: true
    });
});

router.post('/change-password', async function (req, res) {
    try {
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const userId = req.session.authUser.user_id;

        
        // Get current user
        const user = await userService.getUserByID(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }
        
        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update password
        await userService.updatePassword(userId, hashedNewPassword);
        
        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'An error occurred while changing password.' });
    }
});


export default router;
    