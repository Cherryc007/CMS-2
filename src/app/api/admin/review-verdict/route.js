import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Review from "@/models/reviewModel";
import Paper from "@/models/paperModel";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only admins can approve reviews" 
      }, { status: 401 });
    }

    const { reviewId, verdict, adminVerdict } = await request.json();

    // Validate required fields
    if (!reviewId || !verdict || adminVerdict === undefined) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    await connectDB();

    // Find the review
    const review = await Review.findById(reviewId).populate('paper');
    if (!review) {
      return NextResponse.json({ 
        success: false, 
        message: "Review not found" 
      }, { status: 404 });
    }

    // Update review status based on verdict
    review.status = verdict;
    review.adminVerdict = adminVerdict;
    review.adminVerdictAt = new Date();
    await review.save();

    // Update paper status if review is approved
    if (verdict === "approved") {
      const paper = await Paper.findById(review.paper._id);
      if (paper) {
        // Update paper status based on review recommendation
        switch (review.recommendation.toLowerCase()) {
          case "accept":
            paper.status = "Accepted";
            break;
          case "reject":
            paper.status = "Rejected";
            break;
          case "revise":
            paper.status = "Revision Required";
            break;
          default:
            paper.status = "Under Review";
        }
        await paper.save();
      }
    }

    // Send email notification
    try {
      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/sendMail/reviewVerdictAlert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          reviewId: review._id.toString(),
          paperId: review.paper._id.toString(),
          verdict,
          adminVerdict
        }),
      });
      
      if (!emailResponse.ok) {
        console.error("Failed to send email notifications, but verdict was updated successfully");
      }
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Review verdict updated successfully",
      review: {
        id: review._id.toString(),
        status: review.status,
        adminVerdict: review.adminVerdict,
        adminVerdictAt: review.adminVerdictAt
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error updating review verdict:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to update review verdict" 
    }, { status: 500 });
  }
} 