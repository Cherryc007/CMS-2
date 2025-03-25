const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  paper: { type: mongoose.Schema.Types.ObjectId, ref: "Paper", required: true },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  feedback: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: null }, // Optional
  status: {
    type: String,
    enum: [
      "Under Review",
      "Accepted",
      "Rejected",
      "Resubmitted",
      "FinalSubmitted",
      "Archived",
    ],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
module.exports = Review;
