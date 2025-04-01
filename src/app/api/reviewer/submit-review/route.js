import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import Review from "@/models/reviewModel";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has reviewer role
    if (!session || session.user.role !== "reviewer") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only reviewers can submit reviews" 
      }, { status: 401 });
    }
    
    const body = await request.json();
    const { paperId, feedback, rating, status } = body;
    
    if (!paperId || !feedback || !status) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Check if paper exists
    const paper = await Paper.findById(paperId);
    
    if (!paper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found" 
      }, { status: 404 });
    }
    
    // Check if the current user is assigned as reviewer
    if (!paper.reviewer || paper.reviewer.toString() !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        message: "You are not assigned to review this paper" 
      }, { status: 403 });
    }
    
    // Create new review
    const review = await Review.create({
      paper: paperId,
      reviewer: session.user.id,
      feedback,
      rating,
      status
    });
    
    // Update paper status and add review to paper's reviews array
    paper.reviews.push(review._id);
    paper.status = status;
    await paper.save();
    
    return NextResponse.json({ 
      success: true, 
      message: "Review submitted successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to submit review" 
    }, { status: 500 });
  }
} 