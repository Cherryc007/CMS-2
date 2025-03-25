import mongoose from "mongoose"

const conferenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    submissionDeadline: {
        type: Date, 
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
}, { timestamps: true });

const Conference = mongoose.models.Conference || mongoose.model('Conference', conferenceSchema);
export default Conference;
