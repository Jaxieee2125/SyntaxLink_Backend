const mongoose = require('mongoose');

const JobPostingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a job description']
    },
    requirements: {
        type: [String], // Mảng các yêu cầu, ví dụ: ["Node.js", "React", "MongoDB"]
        required: true
    },
    salaryRange: {
        type: String,
        default: 'Negotiable'
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    creator: { // User đã tạo job này
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Chúng ta sẽ thêm company profile sau, tạm thời dùng creator
}, { timestamps: true });

module.exports = mongoose.model('JobPosting', JobPostingSchema);