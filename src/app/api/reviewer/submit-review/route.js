import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Review from "@/models/reviewModel";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";

export async function POST(request) {
  try {
    console.log('Starting review submission process...');
    const session = await auth();
    
    // Check if user is authenticated and has reviewer role
    if (!session || session.user.role !== "reviewer") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only reviewers can submit reviews" 
      }, { status: 401 });
    }

    const data = await request.json();
    const { paperId, comments, recommendation, score } = data;

    // Validate required fields
    if (!paperId || !comments || !recommendation || !score) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    await connectDB();
    
    // Get the reviewer's user ID from the database
    const reviewer = await User.findOne({ email: session.user.email });
    if (!reviewer) {
      return NextResponse.json({ 
        success: false, 
        message: "Reviewer not found in the database" 
      }, { status: 404 });
    }

    // Check if paper exists and reviewer is assigned
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found" 
      }, { status: 404 });
    }

    // Verify reviewer is assigned to this paper
    if (!paper.reviewers.some(reviewerId => reviewerId.toString() === reviewer._id.toString())) {
      return NextResponse.json({ 
        success: false, 
        message: "You are not assigned to review this paper" 
      }, { status: 403 });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      paper: paperId,
      reviewer: reviewer._id
    });

    if (existingReview) {
      return NextResponse.json({ 
        success: false, 
        message: "You have already submitted a review for this paper" 
      }, { status: 400 });
    }

    // Create new review with pending admin approval status
    const review = await Review.create({
      paper: paperId,
      reviewer: reviewer._id,
      comments,
      recommendation,
      score,
      status: "Pending Admin Approval",
      submittedAt: new Date()
    });

    // Send email notification to admin
    try {
      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/sendMail/reviewSubmissionAlert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          reviewId: review._id.toString(),
          paperId: paper._id.toString()
        }),
      });
      
      if (!emailResponse.ok) {
        console.error("Failed to send email notifications, but review was submitted successfully");
      }
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Review submitted successfully and pending admin approval",
      review: {
        id: review._id.toString(),
        comments: review.comments,
        recommendation: review.recommendation,
        score: review.score,
        status: review.status,
        submittedAt: review.submittedAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error in POST /api/reviewer/submit-review:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to submit review" 
    }, { status: 500 });
  }
} 