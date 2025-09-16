const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true , index: true}, // Sẽ thay bằng ObjectId khi có User model
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: false },
    code: { type: String, required: true },
    language: { type: String, required: true }, // e.g., 'python', 'cpp'
    status: {
        type: String,
        enum: ['Pending', 'Judging', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error'],
        default: 'Pending',
    },
    executionTime: { type: Number }, // in ms
    memoryUsed: { type: Number }, // in KB
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Submission', SubmissionSchema);