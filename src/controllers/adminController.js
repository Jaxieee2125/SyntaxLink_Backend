const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const JobPosting = require('../models/JobPosting');

// @desc    Get system-wide statistics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
exports.getSystemStats = async (req, res) => {
    try {
        const [
            userCount,
            problemCount,
            submissionCount,
            contestCount,
            jobCount
        ] = await Promise.all([
            User.countDocuments(),
            Problem.countDocuments(),
            Submission.countDocuments(),
            Contest.countDocuments(),
            JobPosting.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: userCount,
                problems: problemCount,
                submissions: submissionCount,
                contests: contestCount,
                jobs: jobCount
            }
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};