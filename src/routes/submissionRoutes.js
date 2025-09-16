const express = require('express');
const { createSubmission, getSubmissionStatus, getSubmissions } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createSubmission)
    .get(protect, getSubmissions);
router.route('/:id').get(protect,getSubmissionStatus);

module.exports = router;