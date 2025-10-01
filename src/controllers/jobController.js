const JobPosting = require('../models/JobPosting');

// @desc    Create a job posting
// @route   POST /api/v1/jobs
// @access  Private (Employer)
exports.createJobPosting = async (req, res) => {
    try {
        req.body.creator = req.user.id; // Gán người tạo là user đang đăng nhập
        const job = await JobPosting.create(req.body);
        res.status(201).json({ success: true, data: job });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all open job postings
// @route   GET /api/v1/jobs
// @access  Public
exports.getAllJobPostings = async (req, res) => {
     try {
        // Bắt đầu với một query cơ bản
        const query = { status: 'open' };

        // 1. Xử lý tìm kiếm theo từ khóa (search)
        if (req.query.search) {
            // Tìm kiếm không phân biệt chữ hoa/thường trong cả 'title' và 'description'
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // 2. Xử lý lọc theo địa điểm (location)
        if (req.query.location) {
            query.location = { $regex: req.query.location, $options: 'i' };
        }

        const jobs = await JobPosting.find(query)
            .populate('creator', 'name')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get a single job posting
// @route   GET /api/v1/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
    try {
        const job = await JobPosting.findById(req.params.id).populate('creator', 'name');
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update a job posting
// @route   PUT /api/v1/jobs/:id
// @access  Private (Owner of the job)
exports.updateJobPosting = async (req, res) => {
    try {
        let job = await JobPosting.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Đảm bảo user là người tạo job
        if (job.creator.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this job' });
        }

        job = await JobPosting.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete a job posting
// @route   DELETE /api/v1/jobs/:id
// @access  Private (Owner of the job)
exports.deleteJobPosting = async (req, res) => {
    try {
        const job = await JobPosting.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        if (job.creator.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this job' });
        }

        await job.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};