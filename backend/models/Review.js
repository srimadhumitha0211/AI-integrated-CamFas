const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    companyName: { type: String, required: true },
    position: { type: String, required: true },
    review: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    internshipDuration: { type: String, required: true },
    stipend: { type: String },
    skills: { type: String },
    postedAt: { type: Date, default: Date.now },
    isApproved: { type: Boolean, default: false } // For teacher/HOD moderation if needed
});

module.exports = mongoose.model('Review', reviewSchema);