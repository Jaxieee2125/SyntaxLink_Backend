const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const { addSubmissionToQueue } = require('../services/gradingQueue');

// @desc    Create a new submission
exports.createSubmission = async (req, res) => {
    req.body.userId = req.user.id;
    const { problemId, code, language, contestId } = req.body; // Thêm contestId

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, error: 'Problem not found' });
        }
        
        // LOGIC XỬ LÝ CHO CUỘC THI
        if (contestId) {
            const contest = await Contest.findById(contestId);
            if (!contest) {
                return res.status(404).json({ success: false, error: 'Contest not found' });
            }

            const now = new Date();
            if (now < contest.startTime || now > contest.endTime) {
                return res.status(400).json({ success: false, error: 'Contest is not running' });
            }

            if (!contest.participants.includes(req.user.id)) {
                return res.status(403).json({ success: false, error: 'You are not registered for this contest' });
            }

            if (!contest.problems.some(p => p.problemId.toString() === problemId)) {
                return res.status(400).json({ success: false, error: 'Problem is not part of this contest' });
            }
        }

        const newSubmission = await Submission.create({
            problemId,
            userId: req.user.id,
            contestId: contestId || null, // Lưu contestId nếu có
            code,
            language,
        });
        
        addSubmissionToQueue(newSubmission._id);
        
        res.status(202).json({ success: true, submissionId: newSubmission._id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get submission status
exports.getSubmissionStatus = async (req, res) => {
    try {
        // Xóa tham số thứ hai đi, và thêm .populate() để lấy title của problem
        const submission = await Submission.findById(req.params.id)
            .populate('problemId', 'title'); // Lấy thêm title

        if (!submission) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }
        
        res.status(200).json({ success: true, data: submission });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};


exports.getSubmissions = async (req, res) => {
    try {
        // Xây dựng query cơ bản: chỉ lấy submission của user đang đăng nhập
        const query = { userId: req.user.id };

        // Nếu có problemId trong query params, thêm vào bộ lọc
        if (req.query.problemId) {
            query.problemId = req.query.problemId;
        }

        const submissions = await Submission.find(query)
            .populate('problemId', 'title') // Lấy thêm title của problem
            .select('-code') // Không gửi lại code để giảm dung lượng response
            .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu

        res.status(200).json({ success: true, count: submissions.length, data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};