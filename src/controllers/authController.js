const User = require('../models/User');
const Submission = require('../models/Submission');

// @desc    Register user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await User.create({ name, email, password, role });
        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Helper function to get token from model and send response
const sendTokenResponse = (user, statusCode, res) => {
    // 1. Tạo token
    const token = user.getSignedJwtToken();

    // 2. Chuyển Mongoose document thành plain JavaScript object
    const userObject = user.toObject();
    
    // 3. Xóa mật khẩu khỏi object trước khi gửi đi
    delete userObject.password;

    // 4. Gửi response
    res.status(statusCode).json({ 
        success: true, 
        token,
        user: userObject // Luôn luôn sử dụng userObject đã được xử lý
    });
};
exports.getLeaderboard = async (req, res) => {
    try {
        // Sử dụng Aggregation Pipeline của MongoDB để tính điểm
        const leaderboard = await Submission.aggregate([
            // Lọc các bài đã AC
            { $match: { status: 'Accepted' } },
            // Gom nhóm theo userId và đếm số bài AC không trùng lặp
            { $group: {
                _id: '$userId',
                problemsSolved: { $addToSet: '$problemId' } // addToSet để đảm bảo không trùng lặp
            }},
            // Tra cứu thông tin user từ collection 'users'
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
            }},
            // "Unwind" để biến userInfo từ mảng thành object
            { $unwind: '$userInfo' },
            // Định dạng lại output
            { $project: {
                _id: 0,
                userId: '$_id',
                name: '$userInfo.name',
                problemsSolved: { $size: '$problemsSolved' } // Đếm số lượng phần tử trong mảng problemsSolved
            }},
            // Sắp xếp theo số bài giảm dần
            { $sort: { problemsSolved: -1 } },
            // Giới hạn top 100
            { $limit: 100 }
        ]);

        res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};