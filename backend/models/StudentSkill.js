const mongoose = require('mongoose');

const studentSkillSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    level: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        required: true 
    },
    endorsedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

// Ensure a student can't add the same skill twice
studentSkillSchema.index({ studentId: 1, skillId: 1 }, { unique: true });

module.exports = mongoose.model('StudentSkill', studentSkillSchema);