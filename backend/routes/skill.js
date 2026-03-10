const express = require('express');
const mongoose = require('mongoose'); // <- add this if not already
const router = express.Router();
const Skill = require('../models/Skill');
const StudentSkill = require('../models/StudentSkill');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');

// ========== SKILL MANAGEMENT ==========

// Get all skills (predefined list)
router.get('/all-skills', async (req, res) => {
    try {
        const skills = await Skill.find().sort({ category: 1, name: 1 });
        res.json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get student's skills
router.get('/my-skills', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    try {
        const studentSkills = await StudentSkill.find({ studentId: req.session.userId })
            .populate('skillId');
        res.json(studentSkills);
    } catch (error) {
        console.error('Error fetching student skills:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add skill to student profile
router.post('/add-skill', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'student') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const { skillId, level } = req.body;
        
        // Check if already exists
        const existing = await StudentSkill.findOne({
            studentId: req.session.userId,
            skillId: skillId
        });
        
        if (existing) {
            return res.status(400).json({ error: 'Skill already added' });
        }
        
        const studentSkill = new StudentSkill({
            studentId: req.session.userId,
            skillId: skillId,
            level: level
        });
        
        await studentSkill.save();
        res.json({ success: true, message: 'Skill added successfully' });
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update skill level
router.put('/update-skill/:id', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'student') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const { level } = req.body;
        await StudentSkill.findByIdAndUpdate(req.params.id, { level });
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove skill
router.delete('/remove-skill/:id', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'student') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        await StudentSkill.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing skill:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== STUDENT DISCOVERY ==========

// Search students by skill
router.get('/search', async (req, res) => {
    try {
        const { skill, level, department, year } = req.query;
        
        let query = {};
        
        // Build query based on filters
        if (skill) {
            const skillDoc = await Skill.findOne({ name: new RegExp(skill, 'i') });
            if (skillDoc) {
                const studentsWithSkill = await StudentSkill.find({ skillId: skillDoc._id })
                    .distinct('studentId');
                query._id = { $in: studentsWithSkill };
            }
        }
        
        if (department) {
            query.department = department;
        }
        
        // Get students (excluding current user)
        const students = await User.find({
            ...query,
            role: 'student',
            _id: { $ne: req.session.userId }
        }).select('name email department');
        
        // Get their skills
        const results = await Promise.all(students.map(async (student) => {
            const skills = await StudentSkill.find({ studentId: student._id })
                .populate('skillId');
            
            return {
                _id: student._id,
                name: student.name,
                department: student.department,
                skills: skills.map(s => ({
                    id: s.skillId._id,
                    name: s.skillId.name,
                    level: s.level,
                    category: s.skillId.category
                }))
            };
        }));
        
        res.json(results);
    } catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get student profile by ID
router.get('/student/:id', async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .select('name email department');
        
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const skills = await StudentSkill.find({ studentId: student._id })
            .populate('skillId');
        
        // Get connection status
        const connection = await ConnectionRequest.findOne({
            $or: [
                { fromStudent: req.session.userId, toStudent: student._id },
                { fromStudent: student._id, toStudent: req.session.userId }
            ]
        });
        
        res.json({
            student: {
                _id: student._id,
                name: student.name,
                department: student.department
            },
            skills: skills.map(s => ({
                id: s.skillId._id,
                name: s.skillId.name,
                level: s.level,
                category: s.skillId.category
            })),
            connectionStatus: connection ? connection.status : null,
            connectionId: connection?._id
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== CONNECTION REQUESTS ==========

// Send connection request
router.post('/connect', async (req, res) => {
    try {
        console.log('--- CONNECT REQUEST ---');
        console.log('Body:', req.body);          // Check incoming payload
        console.log('Session:', req.session);    // Check session

        const { toStudentId, skillId, messageTemplate, customMessage } = req.body;

        if (!req.session?.userId || req.session.role !== 'student') {
            console.log('Access denied: no session or wrong role');
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!toStudentId || !skillId) {
            console.log('Missing IDs:', { toStudentId, skillId });
            return res.status(400).json({ error: 'Student ID and Skill ID are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(toStudentId) || !mongoose.Types.ObjectId.isValid(skillId)) {
            console.log('Invalid IDs');
            return res.status(400).json({ error: 'Invalid Student ID or Skill ID' });
        }

        const existing = await ConnectionRequest.findOne({
            fromStudent: req.session.userId,
            toStudent: toStudentId,
            skillId: skillId,
            status: 'pending'
        });

        if (existing) {
            console.log('Request already pending');
            return res.status(400).json({ error: 'Request already pending' });
        }

        const request = new ConnectionRequest({
            fromStudent: req.session.userId,
            toStudent: toStudentId,
            skillId: skillId,
            messageTemplate,
            customMessage
        });

        await request.save();
        console.log('Request saved successfully');
        res.json({ success: true, message: 'Request sent successfully' });

    } catch (error) {
        console.error('Error sending request:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Get my connection requests (incoming + outgoing)
router.get('/my-requests', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    try {
        const incoming = await ConnectionRequest.find({ toStudent: req.session.userId })
            .populate('fromStudent', 'name department')
            .populate('skillId');
        
        const outgoing = await ConnectionRequest.find({ fromStudent: req.session.userId })
            .populate('toStudent', 'name department')
            .populate('skillId');
        
        res.json({ incoming, outgoing });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Respond to connection request
router.post('/respond/:id', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    try {
        const { status } = req.body; // 'accepted' or 'declined'
        
        await ConnectionRequest.findByIdAndUpdate(req.params.id, {
            status: status,
            respondedAt: new Date()
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error responding to request:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET student by ID with skills - ADD THIS
router.get('/student/:id', async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .select('name email department');
        
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const skills = await StudentSkill.find({ studentId: student._id })
            .populate('skillId');
        
        res.json({
            student: {
                _id: student._id,
                name: student.name,
                department: student.department
            },
            skills: skills.map(s => ({
                id: s.skillId._id,
                name: s.skillId.name,
                level: s.level,
                category: s.skillId.category
            }))
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;