import mongoose from "mongoose"

const paperSchema = new mongoose.Schema({
    title: { type: String, required: true },
    abstract: { type: String, required: true },
    filePath: { type: String, required: true },
    fileUrl: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    conferenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conference', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { 
        type: String, 
        enum: ['Pending', 'Under Review', 'Accepted', 'Rejected', 'Resubmitted', 'FinalSubmitted', 'Archived'], 
        default: 'Pending' 
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }], // ✅ Store multiple reviews
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Paper = mongoose.models.Paper || mongoose.model("Paper", paperSchema);
export default Paper;