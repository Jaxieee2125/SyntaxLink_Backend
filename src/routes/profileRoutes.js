const express = require('express');
const {
    getCurrentUserProfile,
    createOrUpdateProfile,
    getProfileByUserId,
    getUserStats,
    generateCvPdf
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/me').get(protect, authorize('developer'), getCurrentUserProfile);
router.route('/').post(protect, authorize('developer'), createOrUpdateProfile);
router.route('/user/:userId').get(getProfileByUserId); // Route public để xem profile
router.route('/me/stats').get(protect, authorize('developer'), getUserStats);
router.route('/me/cv').get(protect, authorize('developer'), generateCvPdf);

module.exports = router;