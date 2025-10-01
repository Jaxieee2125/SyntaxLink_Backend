const DeveloperProfile = require('../models/DeveloperProfile');
const User = require('../models/User');
const Submission = require('../models/Submission');
const puppeteer = require('puppeteer');

// @desc    Get current user's profile
// @route   GET /api/v1/profile/me
// @access  Private
exports.getCurrentUserProfile = async (req, res) => {
    try {
        const profile = await DeveloperProfile.findOne({ user: req.user.id })
            .populate('user', ['name', 'email']); // Lấy name, email từ User model

        if (!profile) {
            return res.status(404).json({ success: false, error: 'There is no profile for this user' });
        }
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create or update user profile
// @route   POST /api/v1/profile
// @access  Private
exports.createOrUpdateProfile = async (req, res) => {
    // 1. Destructure đúng cách: lấy cả object 'social'
    const { bio, skills, social, experience, education, projects } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;

    if (bio) profileFields.bio = bio;
    if (skills && Array.isArray(skills)) {
        profileFields.skills = skills;
    }

    // ==========================================================
    // SỬA LỖI LOGIC Ở ĐÂY
    // ==========================================================
    // 2. Kiểm tra xem object 'social' có được gửi lên không
    if (social) {
        profileFields.social = {}; // Khởi tạo object social
        // 3. Gán giá trị từ các thuộc tính BÊN TRONG social object
        if (social.github) profileFields.social.github = social.github;
        if (social.linkedin) profileFields.social.linkedin = social.linkedin;
        if (social.website) profileFields.social.website = social.website;
    }

    if (experience) profileFields.experience = experience;
    if (education) profileFields.education = education;
    if (projects) profileFields.projects = projects;

    try {
        let profile = await DeveloperProfile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).populate('user', ['name', 'email']);

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get profile by user ID
// @route   GET /api/v1/profile/user/:userId
// @access  Public
exports.getProfileByUserId = async (req, res) => {
    try {
        const profile = await DeveloperProfile.findOne({ user: req.params.userId })
            .populate('user', ['name', 'email']);

        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        if(error.kind == 'ObjectId') {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Đếm tổng số bài đã nộp
        const totalSubmissions = await Submission.countDocuments({ userId });

        // Đếm số bài đã được chấp nhận (Accepted)
        const acceptedSubmissions = await Submission.countDocuments({ userId, status: 'Accepted' });

        // Tìm các bài đã giải đúng và không trùng lặp
        const solvedProblems = await Submission.distinct('problemId', { userId, status: 'Accepted' });
        const problemsSolvedCount = solvedProblems.length;
        
        const acceptanceRate = totalSubmissions > 0 
            ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                problemsSolved: problemsSolvedCount,
                totalSubmissions: totalSubmissions,
                acceptanceRate: acceptanceRate,
            }
        });
    } catch (error) {
        console.error("Error in getUserStats:", error); 
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Generate and return user's CV as a PDF
// @route   GET /api/v1/profile/me/cv
// @access  Private
exports.generateCvPdf = async (req, res) => {
    try {
        const profile = await DeveloperProfile.findOne({ user: req.user.id }).populate('user', 'name email');

        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        // ==========================================================
        // XÂY DỰNG CHUỖI HTML HOÀN CHỈNH Ở ĐÂY
        // ==========================================================
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; font-size: 14px; margin: 40px; }
                    .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                    .name { font-size: 32px; font-weight: bold; margin: 0; color: #111; }
                    .email { font-size: 16px; color: #555; margin-top: 5px; }
                    .section { margin-bottom: 25px; page-break-inside: avoid; }
                    .title { font-size: 20px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #8B5CF6; padding-bottom: 5px; margin-bottom: 15px; color: #8B5CF6; }
                    .bio { font-size: 16px; line-height: 1.6; }
                    .skills { display: flex; flex-wrap: wrap; gap: 8px; }
                    .skill { background-color: #E5E7EB; padding: 6px 12px; border-radius: 16px; font-size: 14px; }
                    .timeline-item { margin-bottom: 15px; }
                    .timeline-header { display: flex; justify-content: space-between; align-items: baseline; }
                    .timeline-title { font-size: 16px; font-weight: bold; margin: 0; }
                    .timeline-subtitle { font-size: 15px; font-style: italic; color: #444; margin: 4px 0; }
                    .timeline-date { font-size: 14px; color: #777; }
                    .timeline-description { color: #555; margin-top: 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="name">${profile.user.name}</h1>
                    <p class="email">${profile.user.email}</p>
                </div>
                
                ${profile.bio ? `
                <div class="section">
                    <h2 class="title">Giới thiệu</h2>
                    <p class="bio">${profile.bio}</p>
                </div>` : ''}
                
                ${(profile.skills && profile.skills.length > 0) ? `
                <div class="section">
                    <h2 class="title">Kỹ năng</h2>
                    <div class="skills">${profile.skills.map(s => `<span class="skill">${s}</span>`).join('')}</div>
                </div>` : ''}

                ${(profile.experience && profile.experience.length > 0) ? `
                <div class="section">
                    <h2 class="title">Kinh nghiệm làm việc</h2>
                    ${profile.experience.map(exp => `
                        <div class="timeline-item">
                            <div class="timeline-header">
                                <h3 class="timeline-title">${exp.title}</h3>
                                <span class="timeline-date">${formatDate(exp.from)} - ${formatDate(exp.to)}</span>
                            </div>
                            <p class="timeline-subtitle">${exp.company}</p>
                            ${exp.description ? `<p class="timeline-description">${exp.description}</p>` : ''}
                        </div>
                    `).join('')}
                </div>` : ''}

                ${(profile.projects && profile.projects.length > 0) ? `
                <div class="section">
                    <h2 class="title">Dự án nổi bật</h2>
                    ${profile.projects.map(proj => `
                        <div class="timeline-item">
                            <div class="timeline-header">
                                <h3 class="timeline-title">${proj.name}</h3>
                            </div>
                            <p class="timeline-subtitle">${proj.technologies.join(', ')}</p>
                            <p class="timeline-description">${proj.description}</p>
                            ${proj.link ? `<p class="timeline-description">Link: <a href="${proj.link}">${proj.link}</a></p>` : ''}
                        </div>
                    `).join('')}
                </div>` : ''}

                ${(profile.education && profile.education.length > 0) ? `
                <div class="section">
                    <h2 class="title">Học vấn</h2>
                    ${profile.education.map(edu => `
                        <div class="timeline-item">
                            <div class="timeline-header">
                                <h3 class="timeline-title">${edu.school}</h3>
                                <span class="timeline-date">${formatDate(edu.from)} - ${formatDate(edu.to)}</span>
                            </div>
                            <p class="timeline-subtitle">${edu.degree} - ${edu.fieldOfStudy}</p>
                        </div>
                    `).join('')}
                </div>` : ''}
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' } });

        await browser.close();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=CV_${profile.user.name.replace(/\s/g, '_')}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("PDF Generation Error (Backend):", error);
        res.status(500).json({ success: false, error: 'Server Error while generating PDF' });
    }
};