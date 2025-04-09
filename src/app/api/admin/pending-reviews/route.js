import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Review from "@/models/reviewModel";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only admins can view pending reviews" 
      }, { status: 401 });
    }

    await connectDB();

    // Fetch pending reviews with populated paper and reviewer details
    const pendingReviews = await Review.find({ 
      status: "Pending Admin Approval" 
    })
    .populate({
      path: 'paper',
      select: 'title abstract status conferenceId',
      populate: {
        path: 'conferenceId',
        select: 'name'
      }
    })
    .populate('reviewer', 'name email')
    .sort({ submittedAt: -1 });

    return NextResponse.json({ 
      success: true, 
      reviews: pendingReviews.map(review => ({
        _id: review._id.toString(),
        paper: {
          _id: review.paper._id.toString(),
          title: review.paper.title,
          abstract: review.paper.abstract,
          status: review.paper.status,
          conference: review.paper.conferenceId?.name || 'N/A'
        },
        reviewer: {
          _id: review.reviewer._id.toString(),
          name: review.reviewer.name,
          email: review.reviewer.email
        },
        comments: review.comments,
        recommendation: review.recommendation,
        score: review.score,
        status: review.status,
        submittedAt: review.submittedAt
      }))
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch pending reviews" 
    }, { status: 500 });
  }
} 