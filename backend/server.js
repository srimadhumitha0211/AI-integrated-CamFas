const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Leave = require('./models/Leave');

const app = express();

// Middleware
app.use(express.json());
// app.use(express.static(__dirname));
// app.use(express.static(path.join(__dirname)));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// app.use('/static', express.static(path.join(__dirname, 'staticPages')));

// Add this at the top of your routes, before anything else
app.get('/simple-json-test', (req, res) => {
    res.json({ 
        message: 'This is a simple JSON test',
        working: true,
        time: new Date().toISOString()
    });
});

// Simple session test that always returns JSON
app.get('/debug-session', (req, res) => {
    res.json({
        sessionID: req.sessionID,
        userId: req.session?.user?._id || null,
        role: req.session?.user?.role || null,
        sessionExists: !!req.session
    });
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set true for HTTPS
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Import routes
const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leave');
const approvalRoutes = require('./routes/approval');
const hodRoutes = require('./routes/hod');
const reviewRoutes = require('./routes/review');
const skillRoutes = require('./routes/skill');
const notebooklmRoutes = require('./routes/notebooklKm');
const geminiRoutes = require('./routes/gemini');
const chatbotRoutes = require('./routes/chatbot');



// Use routes
app.use('/auth', authRoutes);
app.use('/leave', leaveRoutes);
app.use('/approval', approvalRoutes);
app.use('/hod', hodRoutes);
app.use('/reviews', reviewRoutes);
app.use('/skills', skillRoutes);
app.use('/notebooklkm', notebooklmRoutes);
app.use('/gemini', geminiRoutes);
app.use('/chatbot', chatbotRoutes);


// Student routes (views)
// In server.js, modify student routes:
app.get('/student/dashboard', async (req, res) => {
    if (req.session.role !== 'student') return res.redirect('/');
    
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/auth/logout');
    
    res.render('student/home', { user });
});

app.get('/student/leave-form', async (req, res) => {
    if (req.session.role !== 'student') return res.redirect('/');
    const user = await User.findById(req.session.userId);
    res.render('student/leave-form', { user });
});

app.get('/student/leave-history', async (req, res) => {
    if (req.session.role !== 'student') return res.redirect('/');
    const user = await User.findById(req.session.userId);
    res.render('student/leave-history', { user });
});

app.get('/', (req, res) => {
    res.render('auth/login');
});

app.get('/register', (req, res) => {
    res.render('auth/register');
});
// Add to server.js before app.listen()
app.get('/api/pending-leaves', async (req, res) => {
    if (req.session.role !== 'teacher') return res.status(403).send('Access denied');
    
    const leaves = await Leave.find({ status: 'pending-teacher' })
        .populate('studentId', 'name');
    
    res.json(leaves.map(leave => ({
        _id: leave._id,
        studentName: leave.studentId.name,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason
    })));
});

// Add these routes before app.listen()

// API: Get leaves pending HOD approval
app.get('/api/pending-hod-leaves', async (req, res) => {
    if (req.session.role !== 'hod') return res.status(403).send('Access denied');
    
    const leaves = await Leave.find({ status: 'pending-hod' })
        .populate('studentId', 'name department');
    
    res.json(leaves.map(leave => ({
        _id: leave._id,
        studentName: leave.studentId.name,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        teacherComment: leave.teacherComment,
        status: leave.status
    })));
});

// API: Get all leaves for HOD view
app.get('/api/all-leaves', async (req, res) => {
    if (req.session.role !== 'hod') return res.status(403).send('Access denied');
    
    const leaves = await Leave.find()
        .populate('studentId', 'name department')
        .sort({ appliedAt: -1 });
    
    res.json(leaves.map(leave => ({
        _id: leave._id,
        studentName: leave.studentId.name,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        teacherComment: leave.teacherComment,
        status: leave.status
    })));
});

// Update HOD dashboard route to pass user data
app.get('/hod/dashboard', async (req, res) => {
    if (req.session.role !== 'hod') return res.redirect('/');
    const user = await User.findById(req.session.userId);
    res.render('hod/dashboard', { user });
});

// Update teacher dashboard route to pass user data
app.get('/teacher/dashboard', async (req, res) => {
    if (req.session.role !== 'teacher') return res.redirect('/');
    const user = await User.findById(req.session.userId);
    res.render('teacher/dashboard', { user });
});
app.get('/test-routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            routes.push(middleware.route.path);
        }
    });
    res.json({ routes: routes.sort() });
});

// Skill portal page
app.get('/student/skill-portal', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'student') {
        return res.redirect('/');
    }
    
    try {
        const user = await User.findById(req.session.userId);
        res.render('student/skill-portal', { user });
    } catch (error) {
        console.error('Error loading skill portal:', error);
        res.status(500).send('Server error');
    }
});

// Test route 2: Direct file check
app.get('/test-hod-file', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'views/hod/dashboard.ejs');
    
    res.json({
        fileExists: fs.existsSync(filePath),
        filePath: filePath,
        viewsFolder: fs.readdirSync(path.join(__dirname, 'views')),
        hodFolder: fs.readdirSync(path.join(__dirname, 'views/hod'))
    });
});


// ===== ADD THESE LINES =====
const fs = require('fs'); // Add at top with other requires if not there

// ===== END ADD =====




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});