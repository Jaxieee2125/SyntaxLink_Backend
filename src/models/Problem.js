const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isSample: { type: Boolean, default: false },
});

const ProblemSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    timeLimit: { type: Number, default: 1 }, // in seconds
    memoryLimit: { type: Number, default: 256 }, // in MB
    testCases: [TestCaseSchema], // Nhúng test cases vào problem
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Problem', ProblemSchema);