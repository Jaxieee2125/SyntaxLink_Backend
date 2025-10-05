const Application = require("../models/Application");
const JobPosting = require("../models/JobPosting");

// @desc    Apply for a job
// @route   POST /api/v1/jobs/:jobId/apply
// @access  Private (Developer)
exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const applicantId = req.user.id;

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }
    if (job.status !== "open") {
      return res
        .status(400)
        .json({
          success: false,
          error: "This job is no longer open for applications",
        });
    }

    // Model index sẽ tự động bắt lỗi nếu user đã apply, nhưng ta có thể check trước để thông báo rõ hơn
    const existingApplication = await Application.findOne({
      jobId,
      applicantId,
    });
    if (existingApplication) {
      return res
        .status(400)
        .json({
          success: false,
          error: "You have already applied for this job",
        });
    }

    const application = await Application.create({ jobId, applicantId });
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    // Bắt lỗi unique index
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          error: "You have already applied for this job",
        });
    }
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get all applications for a specific job
// @route   GET /api/v1/jobs/:jobId/applications
// @access  Private (Job Owner)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    // Security check: Đảm bảo chỉ người tạo job mới xem được danh sách ứng viên
    if (job.creator.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          error: "Not authorized to view these applications",
        });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      // Populate thông tin cơ bản của ứng viên
      .populate("applicantId", "name email")
      // Populate thêm profile của ứng viên đó
      .populate({
        path: "applicantId",
        populate: {
          path: "developerProfile", // Giả sử bạn có một virtual populate từ User sang DeveloperProfile
          model: "DeveloperProfile",
          select: "skills social", // Lấy các trường cần thiết
        },
      });

    res
      .status(200)
      .json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Update an application's status
// @route   PUT /api/v1/applications/:id
// @access  Private (Job Owner)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Kiểm tra xem status có hợp lệ không
    const validStatuses = [
      "submitted",
      "viewed",
      "interview",
      "offered",
      "rejected",
      "hired",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide a valid status" });
    }

    const application = await Application.findById(req.params.id).populate(
      "jobId"
    );
    if (!application) {
      return res
        .status(404)
        .json({ success: false, error: "Application not found" });
    }

    // Security check: Đảm bảo chỉ người tạo job mới được cập nhật status
    // Hoặc người đó phải là admin
    const isOwner = application.jobId.creator.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({
          success: false,
          error: "Not authorized to update this application",
        });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Check if the current user has applied for a job
// @route   GET /api/v1/jobs/:jobId/application-status
// @access  Private (Developer)
exports.getApplicationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applicantId = req.user.id;

    const application = await Application.findOne({ jobId, applicantId });

    res.status(200).json({
      success: true,
      data: {
        hasApplied: !!application, // Trả về true nếu tìm thấy, ngược lại là false
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get all applications for the logged in user
// @route   GET /api/v1/applications/me
// @access  Private (Developer)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicantId: req.user.id })
      .populate({
        path: "jobId",
        select: "title location creator", // Lấy các trường cần thiết từ Job
        populate: {
          path: "creator",
          select: "name", // Lấy tên công ty
        },
      })
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
