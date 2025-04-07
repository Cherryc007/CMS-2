import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import Review from "@/models/reviewModel";
import { auth } from "@/auth";

/**
 * GET endpoint to fetch a reviewer's review history for a specific paper
 * @param {Object} request - The request object
 * @param {Object} params - URL parameters containing paperId
 * @returns {Object} Review details including feedback, rating, status, and file information
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has reviewer role
    if (!session || session.user.role !== "reviewer") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only reviewers can access review history" 
      }, { status: 401 });
    }
    
    const { paperId } = params;
    
    await connectDB();
    
    // Find the paper and its review by this reviewer
    const paper = await Paper.findById(paperId)
      .populate({
        path: 'reviews',
        match: { reviewer: session.user.id },
        select: 'feedback rating status fileUrl filePath reviewer'
      })
      .select('title')
      .lean();
    
    if (!paper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found" 
      }, { status: 404 });
    }
    
    // Get the review by this reviewer
    const review = paper.reviews[0];
    
    if (!review) {
      return NextResponse.json({ 
        success: false, 
        message: "No review found for this paper" 
      }, { status: 404 });
    }
    
    // Format review data for frontend
    const formattedReview = {
      id: review._id.toString(),
      paperTitle: paper.title,
      feedback: review.feedback,
      rating: review.rating,
      status: review.status,
      fileUrl: review.fileUrl,
      filePath: review.filePath
    };
    
    return NextResponse.json({ 
      success: true, 
      review: formattedReview 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching review history:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch review history" 
    }, { status: 500 });
  }
} 