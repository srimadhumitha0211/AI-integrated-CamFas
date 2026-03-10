const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');

// Teacher approve/reject
router.post('/teacher/:id', async (req, res) => {
    if (req.session.role !== 'teacher') return res.redirect('/login');
    
    const { action, comment } = req.body;
    const status = action === 'approve' ? 'pending-hod' : 'rejected';
    
    await Leave.findByIdAndUpdate(req.params.id, {
        status,
        teacherComment: comment
    });
    
    res.redirect('/teacher/dashboard');
});

// HOD approve/reject
// HOD approve/reject
// Add this function at the top
const User = require('../models/User');

// ... existing teacher approval code ...

// HOD approve/reject - FIXED VERSION
router.post('/hod/:id', async (req, res) => {
    if (req.session.role !== 'hod') {
        return res.status(403).send('Access denied');
    }
    
    try {
        const { action, comment } = req.body;
        const status = action === 'approve' ? 'approved' : 'rejected';
        
        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            {
                status: status,
                hodComment: comment
            },
            { new: true }
        );
        
        if (!leave) {
            return res.status(404).send('Leave application not found');
        }
        
        // For JSON API response
        if (req.headers['content-type'] === 'application/json') {
            return res.json({ success: true, message: `Leave ${status}`, leave });
        }
        
        // For form submission redirect
        res.redirect('/hod/dashboard');
        
    } catch (error) {
        console.error('HOD approval error:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;