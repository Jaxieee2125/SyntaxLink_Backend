// routes/adminJobs.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Job = require('../models/JobPosting');

router.use(protect, authorize('admin'));

// GET /api/v1/admin/jobs?status=pending|approved|rejected&q=&page=&limit=
router.get('/jobs', async (req, res) => {
  const { status, q, page=1, limit=20 } = req.query;
  const filter = {};
  if (status) filter.moderationStatus = status;     
  if (q) filter.title = { $regex: q, $options: 'i' };

  const cursor = Job.find(filter).populate('creator','name email').sort('-createdAt')
    .skip((page-1)*limit).limit(Number(limit));
  const [items, total] = await Promise.all([cursor, Job.countDocuments(filter)]);
  res.json({ success:true, items, total, page:Number(page), limit:Number(limit) });
});

// GET /api/v1/admin/jobs/:id
router.get('/jobs/:id', async (req,res)=>{
  const job = await Job.findById(req.params.id).populate('creator','name email');
  if (!job) return res.status(404).json({ success:false, error:'Not found' });
  res.json({ success:true, data: job });
});

// PATCH /api/v1/admin/jobs/:id/approve  body: { decision: 'approved'|'rejected' }
router.patch('/jobs/:id/approve', async (req,res)=>{
  const { decision } = req.body;
  if (!['approved','rejected'].includes(decision))
    return res.status(400).json({ success:false, error:'Invalid decision' });

  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { moderationStatus: decision, approvedBy: req.user.id, approvedAt: new Date() },
    { new:true }
  );
  if (!job) return res.status(404).json({ success:false, error:'Not found' });
  res.json({ success:true, data: job });
});

// DELETE /api/v1/admin/jobs/:id
router.delete('/jobs/:id', async (req,res)=>{
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success:false, error:'Not found' });
  await job.deleteOne();
  res.json({ success:true, data:{} });
});

module.exports = router;
