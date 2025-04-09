import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema({
  paper: { type: mongoose.Schema.Types.ObjectId, ref: "Paper", required: true },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: {
    type: String,
    required: true
  },
  recommendation: {
    type: String,
    required: true,
    enum: ['accept', 'reject', 'revise']
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending Admin Approval', 'approved', 'rejected', 'revision'],
    default: 'Pending Admin Approval'
  },
  adminVerdict: {
    type: Boolean,
    default: false
  },
  adminVerdictAt: {
    type: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  filePath: { type: String }, // Optional field for uploaded review file
  fileUrl: { type: String }, // URL for the review file in Vercel Blob
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add indexes for better query performance
reviewSchema.index({ paper: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ status: 1 });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
