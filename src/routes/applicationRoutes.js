const express = require('express');
const { updateApplicationStatus } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/:id').put(protect, authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;