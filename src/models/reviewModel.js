import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema({
  paper: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Paper", 
    required: [true, "Paper reference is required"] 
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Reviewer reference is required"],
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [5000, "Comments cannot be more than 5000 characters"]
  },
  recommendation: {
    type: String,
    enum: ['accept', 'reject', 'revise'],
    lowercase: true
  },
  score: {
    type: Number,
    min: [1, "Score must be at least 1"],
    max: [5, "Score cannot be more than 5"]
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Under Review', 'Submitted', 'Approved', 'Rejected', 'Revision Required'],
    default: 'Pending'
  },
  adminVerdict: {
    type: Boolean,
    default: false
  },
  adminVerdictAt: {
    type: Date
  },
  submittedAt: {
    type: Date
  },
  filePath: { 
    type: String,
    trim: true
  },
  fileUrl: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  }
}, { 
  timestamps: true 
});

// Add indexes for better query performance
reviewSchema.index({ paper: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ status: 1 });
reviewSchema.index({ submittedAt: -1 });

// Pre-save middleware to update adminVerdictAt when verdict changes
reviewSchema.pre('save', function(next) {
  if (this.isModified('adminVerdict')) {
    this.adminVerdictAt = new Date();
  }
  next();
});

// Virtual for getting the review status in a more readable format
reviewSchema.virtual('statusText').get(function() {
  return this.status.replace(/([A-Z])/g, ' $1').trim();
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
