const express = require('express');
const { getSystemStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Bảo vệ tất cả các route trong file này
router.use(protect);
router.use(authorize('admin'));

router.route('/stats').get(getSystemStats);

module.exports = router;