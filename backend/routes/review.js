const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');

// POST - Submit a new review (students only)
router.post('/submit', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'student') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const user = await User.findById(req.session.userId);
        
        const review = new Review({
            studentId: req.session.userId,
            studentName: user.name,
            companyName: req.body.companyName,
            position: req.body.position,
            review: req.body.review,
            rating: req.body.rating,
            internshipDuration: req.body.internshipDuration,
            stipend: req.body.stipend,
            skills: req.body.skills,
            isApproved: false // Set to true if you want auto-approve
        });
        
        await review.save();
        res.redirect('/student/dashboard?review=success');
    } catch (error) {
        console.error('Review submission error:', error);
        res.status(500).send('Error submitting review');
    }
});

// GET - Fetch all approved reviews
router.get('/all', async (req, res) => {
    try {
        const reviews = await Review.find({ isApproved: true })
            .sort({ postedAt: -1 })
            .limit(50);
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - Fetch student's own reviews
router.get('/my-reviews', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const reviews = await Review.find({ studentId: req.session.userId })
            .sort({ postedAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching my reviews:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - Fetch pending reviews (for teacher/HOD)
router.get('/pending', async (req, res) => {
    if (req.session.role !== 'teacher' && req.session.role !== 'hod') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const reviews = await Review.find({ isApproved: false })
            .sort({ postedAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching pending reviews:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST - Reject review
router.post('/reject/:id', async (req, res) => {
    if (req.session.role !== 'teacher' && req.session.role !== 'hod') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        await Review.findByIdAndDelete(req.params.id); // Delete rejected review
        res.json({ success: true });
    } catch (error) {
        console.error('Error rejecting review:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// POST - Approve review (teacher/HOD only)
router.post('/approve/:id', async (req, res) => {
    if (req.session.role !== 'teacher' && req.session.role !== 'hod') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        await Review.findByIdAndUpdate(req.params.id, { isApproved: true });
        res.json({ success: true });
    } catch (error) {
        console.error('Error approving review:', error);
        res.status(500).json({ error: 'Server error' });
    }
});




module.exports = router;