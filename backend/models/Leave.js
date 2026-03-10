const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    leaveType: String,
    startDate: Date,
    endDate: Date,
    reason: String,
    status: { 
        type: String, 
        enum: ['pending-teacher', 'pending-hod', 'approved', 'rejected'],
        default: 'pending-teacher'
    },
    teacherComment: String,
    hodComment: String,
    appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leave', leaveSchema);