const Contest = require('../models/Contest');
const User = require('../models/User');
const Submission = require('../models/Submission');

// @desc    Create a contest
// @route   POST /api/v1/contests
// @access  Private (Admin/Employer)
exports.createContest = async (req, res) => {
    try {
        req.body.creator = req.user.id; // Gán người tạo là user đang đăng nhập
        const contest = await Contest.create(req.body);
        res.status(201).json({ success: true, data: contest });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all contests
// @route   GET /api/v1/contests
// @access  Public
exports.getAllContests = async (req, res) => {
    try {
        const contests = await Contest.find().populate('creator', 'name');
        res.status(200).json({ success: true, data: contests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single contest
// @route   GET /api/v1/contests/:id
// @access  Public
exports.getContestById = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id)
            .populate('creator', 'name')
            .populate('problems.problemId', 'title'); // Lấy cả title của problem

        if (!contest) {
            return res.status(404).json({ success: false, error: 'Contest not found' });
        }
        res.status(200).json({ success: true, data: contest });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.registerForContest = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ success: false, error: 'Contest not found' });
        }

        // Kiểm tra xem user đã đăng ký chưa
        if (contest.participants.includes(req.user.id)) {
            return res.status(400).json({ success: false, error: 'User already registered' });
        }

        // Thêm user vào danh sách tham gia
        contest.participants.push(req.user.id);
        await contest.save();

        res.status(200).json({ success: true, data: 'Successfully registered for the contest' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getScoreboard = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate('participants', 'name');
        if (!contest) {
            return res.status(404).json({ success: false, error: 'Contest not found' });
        }

        // Lấy tất cả submission của contest này
        const submissions = await Submission.find({ contestId: req.params.id });

        // Dùng Map để tổng hợp kết quả cho từng user
        const scoreboardMap = new Map();

        // Khởi tạo scoreboard cho tất cả những người tham gia
        contest.participants.forEach(p => {
            scoreboardMap.set(p._id.toString(), {
                userId: p._id,
                name: p.name,
                problemsSolved: 0,
                totalPenalty: 0,
                problemStats: {}, // { problemId: { attempts: 0, solvedTime: 0 } }
            });
        });

        // Sắp xếp submissions theo thời gian để xử lý cho đúng
        submissions.sort((a, b) => a.createdAt - b.createdAt);

        // Bắt đầu tính điểm
        for (const sub of submissions) {
            const userId = sub.userId.toString();
            const problemId = sub.problemId.toString();

            const userStat = scoreboardMap.get(userId);
            if (!userStat) continue; // Bỏ qua nếu user không có trong ds tham gia

            // Khởi tạo thông tin cho bài toán nếu chưa có
            if (!userStat.problemStats[problemId]) {
                userStat.problemStats[problemId] = { attempts: 0, solved: false, solvedTime: 0 };
            }

            const problemStat = userStat.problemStats[problemId];
            
            // Chỉ xử lý nếu bài này chưa được giải
            if (!problemStat.solved) {
                if (sub.status === 'Accepted') {
                    problemStat.solved = true;
                    userStat.problemsSolved += 1;
                    
                    const timeDiffMinutes = (sub.createdAt - contest.startTime) / (1000 * 60);
                    problemStat.solvedTime = Math.round(timeDiffMinutes);
                    
                    const penalty = problemStat.solvedTime + (problemStat.attempts * 20);
                    userStat.totalPenalty += penalty;
                } else if (sub.status !== 'Judging' && sub.status !== 'Pending') {
                    problemStat.attempts += 1;
                }
            }
        }

        // Chuyển Map thành Array và sắp xếp
        const scoreboard = Array.from(scoreboardMap.values());
        scoreboard.sort((a, b) => {
            if (a.problemsSolved !== b.problemsSolved) {
                return b.problemsSolved - a.problemsSolved; // Nhiều bài hơn xếp trước
            }
            return a.totalPenalty - b.totalPenalty; // Ít penalty hơn xếp trước
        });

        res.status(200).json({ success: true, data: scoreboard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};