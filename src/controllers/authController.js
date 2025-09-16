const User = require('../models/User');

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
