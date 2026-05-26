import mongoose from "mongoose";

const multiAgentCourseSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  courseDescription: {
    type: String,
    default: ''
  },
  topic: {
    type: String,
    required: true
  },
  difficultyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  modules: [{
    title: {
      type: String,
      required: true
    },
    youtubeVideoUrl: {
      type: String
    },
    youtubeVideoId: {
      type: String
    },
    youtubeVideos: [{
      id: { type: String },
      title: { type: String },
      description: { type: String },
      thumbnail: { type: String },
      channelTitle: { type: String },
      publishedAt: { type: String },
      embedUrl: { type: String },
      watchUrl: { type: String },
      duration: { type: String },
      viewCount: { type: Number },
      likeCount: { type: Number }
    }],
    structuredContent: {
      type: String
    },
    images: [{
      type: String
    }],
    resources: [{
      title: { type: String },
      url: { type: String }
    }]
  }],
  status: {
    type: String,
    enum: ['Generating', 'PendingEducatorReview', 'RevisionsRequested', 'Approved'],
    default: 'Generating'
  },
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('MultiAgentCourse', multiAgentCourseSchema);