const express = require('express');
const router = express.Router();
const User = require('../models/User');

// HOD Dashboard
router.get('/dashboard', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'hod') {
        return res.redirect('/');
    }
    
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.redirect('/');
        }
        res.render('hod/dashboard', { user });
    } catch (error) {
        console.error('HOD dashboard error:', error);
        res.status(500).send('Server error');
    }
});

// Add more HOD view routes here if needed
router.get('/reports', async (req, res) => {
    if (req.session.role !== 'hod') return res.redirect('/');
    const user = await User.findById(req.session.userId);
    res.render('hod/reports', { user });
});

module.exports = router;
