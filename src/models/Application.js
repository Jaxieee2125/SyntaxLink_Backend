const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPosting',
        required: true
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['submitted', 'viewed', 'interview', 'offered', 'rejected', 'hired'],
        default: 'submitted'
    },
    // Trong tương lai, có thể thêm trường lưu lại CV tại thời điểm ứng tuyển
    // resumeSnapshot: { type: String } 
}, { timestamps: true });

// Đảm bảo một user chỉ có thể ứng tuyển vào một job một lần duy nhất
ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);