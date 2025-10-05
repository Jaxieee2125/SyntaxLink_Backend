const express = require('express');
const { createProblem, getAllProblems, getProblemById, updateProblem, deleteProblem } = require('../controllers/problemController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware
const router = express.Router();

router.route('/')
    .get(getAllProblems)
    .post(protect, authorize('admin'), createProblem); 

router.route('/:id')
    .get(getProblemById)
    .put(protect, authorize('admin'), updateProblem) // Thêm route
    .delete(protect, authorize('admin'), deleteProblem); // Thêm route

module.exports = router;