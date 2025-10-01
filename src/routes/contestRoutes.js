const express = require('express');
const { createContest, getAllContests, getContestById, registerForContest, getScoreboard } = require('../controllers/contestController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getAllContests)
    .post(protect, authorize('admin', 'employer'), createContest); // Chỉ admin/employer được tạo

router.route('/:id')
    .get(getContestById);

router.route('/:id/register').post(protect, authorize('developer'), registerForContest);

router.route('/:id/scoreboard').get(getScoreboard);

module.exports = router;