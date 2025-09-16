const mongoose = require('mongoose');

const ContestProblemSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    alias: { // Tên bài trong contest, ví dụ: 'A', 'B', 'C'
        type: String,
        required: true,
    },
});

const ContestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    problems: [ContestProblemSchema],
    participants: [{ // Lưu danh sách user đã đăng ký
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    creator: { // Ai đã tạo cuộc thi
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Contest', ContestSchema);