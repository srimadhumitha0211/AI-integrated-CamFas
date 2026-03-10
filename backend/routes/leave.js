const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');

// Submit leave
router.post('/submit', async (req, res) => {
    if (req.session.role !== 'student') return res.redirect('/login');
    
    const leave = new Leave({
        studentId: req.session.userId,
        leaveType: req.body.leaveType,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        reason: req.body.reason
    });
    
    await leave.save();
    res.redirect('/student/leave-history');
});

// Get student's leaves
router.get('/my-leaves', async (req, res) => {
    if (req.session.role !== 'student') return res.redirect('/login');
    
    const leaves = await Leave.find({ studentId: req.session.userId })
        .sort({ appliedAt: -1 });
    res.json(leaves);
});

module.exports = router;