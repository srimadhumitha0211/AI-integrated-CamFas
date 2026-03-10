const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { 
        type: String, 
        enum: ['technical', 'soft', 'language', 'tool'],
        required: true 
    },
    icon: { type: String, default: '🔹' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Skill', skillSchema);