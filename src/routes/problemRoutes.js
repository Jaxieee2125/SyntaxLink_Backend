const express = require('express');
const { createProblem, getAllProblems, getProblemById } = require('../controllers/problemController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware
const router = express.Router();

router.route('/')
    .get(getAllProblems)
    .post(protect, authorize('admin'), createProblem); // Áp dụng middleware ở đây

router.route('/:id').get(getProblemById);

module.exports = router;