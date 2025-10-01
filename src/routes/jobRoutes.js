const express = require("express");
const {
  createJobPosting,
  getAllJobPostings,
  getJobById,
  updateJobPosting,
  deleteJobPosting,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { applyForJob, getJobApplications, getApplicationStatus } = require('../controllers/applicationController');

const router = express.Router();

router
  .route("/")
  .get(getAllJobPostings)
  .post(protect, authorize("employer", "admin"), createJobPosting);

router
  .route("/:id")
  .get(getJobById)
  .put(protect, authorize("employer", "admin"), updateJobPosting)
  .delete(protect, authorize("employer", "admin"), deleteJobPosting);

router
  .route("/:jobId/apply")
  .post(protect, authorize("developer"), applyForJob);
router
  .route("/:jobId/applications")
  .get(protect, authorize("employer", "admin"), getJobApplications);

router.route('/:jobId/application-status').get(protect, authorize('developer'), getApplicationStatus);

module.exports = router;
