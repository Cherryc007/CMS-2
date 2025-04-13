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

    const isAssigned = paper.reviewers.some(
      (reviewer) => reviewer._id.toString() === session.user.id
    );

    if (!isAssigned) {
      return NextResponse.json(
        { message: "You are not assigned to review this paper" },
        { status: 403 }
      );
    }

    // Map recommendation to status
    const statusMap = {
      accept: "Submitted",
      reject: "Submitted",
      revise: "Submitted"
    };

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