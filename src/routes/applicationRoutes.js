const express = require('express');
const { updateApplicationStatus, getMyApplications } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/:id').put(protect, authorize('employer', 'admin'), updateApplicationStatus);
// Route mới cho người dùng
router.route('/me').get(protect, authorize('developer'), getMyApplications);
// Route cũ cho nhà tuyển dụng
router.route('/:id').put(protect, authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;