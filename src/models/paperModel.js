import mongoose from "mongoose"

const paperSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    abstract: {
        type: String,
        required: [true, "Abstract is required"],
        trim: true
    },
    filePath: { type: String, required: true },
    fileUrl: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Author is required"]
    },
    conferenceId: {
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

// Add index for faster queries
paperSchema.index({ author: 1, status: 1 });
paperSchema.index({ conferenceId: 1 });

// Pre-save middleware to update lastUpdated
paperSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

const Paper = mongoose.models.Paper || mongoose.model("Paper", paperSchema);
export default Paper;