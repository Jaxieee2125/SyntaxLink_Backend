const mongoose = require('mongoose');

// Sub-schema cho Kinh nghiệm làm việc
const WorkExperienceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    from: { type: Date, required: true },
    to: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String }
});

// Sub-schema cho Học vấn
const EducationSchema = new mongoose.Schema({
    school: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date }
});

// Sub-schema cho Dự án cá nhân
const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    technologies: { type: [String], required: true },
    link: { type: String }
});

const DeveloperProfileSchema = new mongoose.Schema({
    user: { // Liên kết 1-1 tới User model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: { type: String },
    skills: {
        type: [String],
        required: true
    },
    social: {
        github: { type: String },
        linkedin: { type: String },
        website: { type: String }
    },
    experience: [WorkExperienceSchema],
    education: [EducationSchema],
    projects: [ProjectSchema]
}, { timestamps: true });

module.exports = mongoose.model('DeveloperProfile', DeveloperProfileSchema);