const express = require('express');
const router = express.Router();

// 1. Import tất cả các file route con
const authRoutes = require('./authRoutes');
const problemRoutes = require('./problemRoutes');
const submissionRoutes = require('./submissionRoutes');
const contestRoutes = require('./contestRoutes');
const jobRoutes = require('./jobRoutes');
const applicationRoutes = require('./applicationRoutes'); 
const profileRoutes = require('./profileRoutes');

// 2. "Gắn" các route con vào router chính
// Ví dụ: mọi request đến '/auth' sẽ được chuyển cho authRoutes xử lý
router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/contests', contestRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/profile', profileRoutes);

// 3. Xuất ra router chính đã được cấu hình
module.exports = router;