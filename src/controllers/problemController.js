const Problem = require('../models/Problem');

// @desc    Create a new problem (Admin only)
exports.createProblem = async (req, res) => {
    try {
        const problem = await Problem.create(req.body);
        res.status(201).json({ success: true, data: problem });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all problems
exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}, 'title difficulty'); // Chỉ lấy title và difficulty
        res.status(200).json({ success: true, data: problems });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get a single problem by ID
exports.getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ success: false, error: 'Problem not found' });
        }
        res.status(200).json({ success: true, data: problem });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};