// routes/notebooklm.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Main AI Study Assistant page
router.get('/assistant', async (req, res) => {
    console.log('AI Assistant route accessed'); // Debug log
    console.log('Session:', req.session); // Debug log
    
    if (!req.session.userId || req.session.role !== 'student') {
        console.log('Access denied - redirecting to login');
        return res.redirect('/');
    }
    
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            console.log('User not found');
            return res.redirect('/auth/logout');
        }
        
        console.log('User found:', user.name);
        
        // You can store different notebook URLs for different departments
        const notebooks = {
            'CSE': 'https://notebooklm.google.com/notebook/your-cse-notebook-id',
            'AI&DS': 'https://notebooklm.google.com/notebook/your-ai-notebook-id',
            'ECE': 'https://notebooklm.google.com/notebook/your-ece-notebook-id',
            'EEE': 'https://notebooklm.google.com/notebook/your-eee-notebook-id',
            'MECH': 'https://notebooklm.google.com/notebook/your-mech-notebook-id'
        };
        
        const notebookUrl = notebooks[user.department] || notebooks['CSE'];
        
        res.render('student/ai-assistant', { 
            user, 
            notebookUrl,
            department: user.department
        });
    } catch (error) {
        console.error('Error loading AI assistant:', error);
        res.status(500).send('Server error: ' + error.message);
    }
});

// Route to get department-specific notebook
router.get('/notebook/:department', async (req, res) => {
    const notebooks = {
        'CSE': 'https://notebooklm.google.com/notebook/your-cse-notebook-id',
        'AI&DS': 'https://notebooklm.google.com/notebook/your-ai-notebook-id',
        'ECE': 'https://notebooklm.google.com/notebook/your-ece-notebook-id',
        'EEE': 'https://notebooklm.google.com/notebook/your-eee-notebook-id',
        'MECH': 'https://notebooklm.google.com/notebook/your-mech-notebook-id'
    };
    
    res.json({ url: notebooks[req.params.department] });
});

module.exports = router;