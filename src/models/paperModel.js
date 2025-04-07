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
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Accepted', 'Rejected', 'Resubmitted', 'RequestResubmit', 'FinalSubmitted'],
        default: 'Pending'
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }], // ✅ Store multiple reviews
    resubmissionHistory: [{
        version: Number,
        fileUrl: String,
        filePath: String,
        submittedAt: {
            type: Date,
            default: Date.now
        },
        feedback: String
    }],
    currentVersion: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Add index for faster queries
paperSchema.index({ author: 1, status: 1 });
paperSchema.index({ reviewer: 1, status: 1 });
paperSchema.index({ conferenceId: 1 });

const Paper = mongoose.models.Paper || mongoose.model("Paper", paperSchema);
export default Paper;