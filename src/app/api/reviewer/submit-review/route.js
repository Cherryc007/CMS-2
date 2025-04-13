import connectDB from "@/lib/connectDB";
import Review from "@/models/reviewModel";
import Paper from "@/models/paperModel";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendReviewSubmissionAlert } from "@/app/api/sendMail/reviewSubmissionAlert/route";

export async function POST(request) {
  let session;
  try {
    session = await auth();
    
    if (!session || session.user.role !== "reviewer") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Reviewer access required" 
      }, { status: 401 });
    }

    await connectDB();

    const { paperId, comments, recommendation, score } = await request.json();

    if (!paperId || !comments || !recommendation || !score) {
      return NextResponse.json({ 
        success: false, 
        message: "All fields are required" 
      }, { status: 400 });
    }

    // Check if paper exists and reviewer is assigned
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found" 
      }, { status: 404 });
    }

    if (!paper.reviewers.includes(session.user.id)) {
      return NextResponse.json({ 
        success: false, 
        message: "You are not assigned to review this paper" 
      }, { status: 403 });
    }

    // Find existing review or create new one
    let review = await Review.findOne({
      paper: paperId,
      reviewer: session.user.id
    });

    if (!review) {
      // Create new review
      review = new Review({
        paper: paperId,
        reviewer: session.user.id,
        comments,
        recommendation,
        score,
        status: "Submitted",
        submittedAt: new Date()
      });
    } else {
      // Update existing review
      review.comments = comments;
      review.recommendation = recommendation;
      review.score = score;
      review.status = "Submitted";
      review.submittedAt = new Date();
    }

    await review.save();

    return NextResponse.json({ 
      success: true, 
      message: "Review submitted successfully",
      review: {
        _id: review._id,
        paper: review.paper,
        reviewer: review.reviewer,
        comments: review.comments,
        recommendation: review.recommendation,
        score: review.score,
        status: review.status,
        submittedAt: review.submittedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in submitReview:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to submit review" 
    }, { status: 500 });
  }
} 