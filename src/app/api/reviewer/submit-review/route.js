import connectDB from "@/lib/connectDB";
import Review from "@/models/reviewModel";
import Paper from "@/models/paperModel";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendReviewSubmissionAlert } from "@/app/api/sendMail/reviewSubmissionAlert/route";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "reviewer") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { paperId, comments, recommendation, score, filePath, fileUrl } = await req.json();

    if (!paperId || !comments || !recommendation || !score) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    console.log("Checking paper and reviewer assignment...");
    console.log("Paper ID:", paperId);
    console.log("Reviewer ID:", session.user.id);

    // Check if reviewer is assigned to this paper
    const paper = await Paper.findById(paperId)
      .populate("reviewers")
      .populate("conference");
      
    if (!paper) {
      return NextResponse.json(
        { message: "Paper not found" },
        { status: 404 }
      );
    }

    console.log("Paper found:", {
      id: paper._id,
      title: paper.title,
      reviewers: paper.reviewers.map(r => r._id.toString())
    });

    const isAssigned = paper.reviewers.some(
      (reviewer) => reviewer._id.toString() === session.user.id
    );

    if (!isAssigned) {
      return NextResponse.json(
        { message: "You are not assigned to review this paper" },
        { status: 403 }
      );
    }

    // Check if review already exists
    console.log("Checking for existing review...");
    const existingReview = await Review.findOne({
      paper: paperId,
      reviewer: session.user.id
    });

    if (existingReview) {
      console.log("Existing review found:", {
        reviewId: existingReview._id,
        paperId: existingReview.paper,
        reviewerId: existingReview.reviewer,
        status: existingReview.status,
        submittedAt: existingReview.submittedAt
      });
      return NextResponse.json(
        { 
          message: "You have already submitted a review for this paper",
          details: {
            reviewId: existingReview._id,
            submittedAt: existingReview.submittedAt
          }
        },
        { status: 400 }
      );
    }

    // Map recommendation to status
    const statusMap = {
      accept: "Submitted",
      reject: "Submitted",
      revise: "Submitted"
    };

    console.log("Creating new review...");
    const review = await Review.create({
      paper: paperId,
      reviewer: session.user.id,
      comments,
      recommendation,
      score,
      status: statusMap[recommendation],
      filePath,
      fileUrl,
      submittedAt: new Date()
    });

    // Update paper status
    paper.status = "Under Review";
    await paper.save();

    // Send email notification
    await sendReviewSubmissionAlert({
      paperId: paper._id,
      paperTitle: paper.title,
      reviewerName: session.user.name,
      reviewerEmail: session.user.email,
      status: review.status
    });

    return NextResponse.json(
      {
        message: "Review submitted successfully",
        review: {
          _id: review._id,
          paper: paper._id,
          reviewer: session.user.id,
          comments: review.comments,
          recommendation: review.recommendation,
          score: review.score,
          status: review.status,
          submittedAt: review.submittedAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { message: "Failed to submit review", error: error.message },
      { status: 500 }
    );
  }
} 