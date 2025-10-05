const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  console.log('[protect] Kiểm tra Authorization header...');
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('[protect] Token nhận được:', token);
  } else {
    console.warn('[protect] Không có Authorization header hoặc không đúng định dạng.');
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Không có token - Từ chối truy cập' });
  }

  try {
    console.log('[protect] Giải mã token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[protect] Token hợp lệ. decoded:', decoded);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      console.warn('[protect] Không tìm thấy user trong DB với id:', decoded.id);
      return res.status(401).json({ success: false, error: 'Không tìm thấy người dùng - Từ chối truy cập' });
    }

    console.log('[protect] Người dùng hợp lệ:', req.user.email || req.user._id);
    next();
  } catch (err) {
    console.error('[protect] Lỗi xác thực token:', err.message);
    return res.status(401).json({ success: false, error: 'Token không hợp lệ - Từ chối truy cập' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};