const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    messageTemplate: { type: String, required: true },
    customMessage: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'completed', 'declined'],
        default: 'pending'
    },
    meetingDetails: {
        location: String,
        time: Date,
        notes: String
    },
    createdAt: { type: Date, default: Date.now },
    respondedAt: Date
});

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);