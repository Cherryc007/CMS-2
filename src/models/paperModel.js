import mongoose from "mongoose"

const paperSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [200, "Title cannot be more than 200 characters"]
    },
    abstract: {
        type: String,
        required: [true, "Abstract is required"],
        trim: true,
        maxlength: [2000, "Abstract cannot be more than 2000 characters"]
    },
    filePath: { 
        type: String, 
        required: [true, "File path is required"],
        trim: true
    },
    fileUrl: { 
        type: String, 
        required: [true, "File URL is required"],
        trim: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Author is required"]
    },
    conference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conference',
        required: [true, "Conference is required"]
    },
    reviewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    status: {
        type: String,
        required: true,
        enum: [
            'Pending',
            'Under Review',
            'Revision Required',
            'Accepted',
            'Rejected'
        ],
        default: 'Pending'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for faster queries
paperSchema.index({ author: 1, status: 1 });
paperSchema.index({ conference: 1 });
paperSchema.index({ reviewers: 1 }); // Add index for reviewer queries

// Pre-save middleware to update lastUpdated
paperSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Virtual for getting the current reviewer count
paperSchema.virtual('reviewerCount').get(function() {
    return this.reviewers.length;
});

// Method to check if a user is a reviewer
paperSchema.methods.isReviewer = function(userId) {
    return this.reviewers.some(reviewer => reviewer.toString() === userId.toString());
};

const Paper = mongoose.models.Paper || mongoose.model("Paper", paperSchema);
export default Paper;