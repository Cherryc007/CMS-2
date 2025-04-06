import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
// Import Review model dynamically to handle missing model case
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
    const { paperId, feedback, rating, status, filePath } = body;
    
    if (!paperId || !feedback || !status) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Check if paper exists and populate author
    const paper = await Paper.findById(paperId).populate('author', 'name email _id');
    
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
    
    // Dynamically load the Review model to handle potential missing model
    let Review;
    try {
      Review = require('@/models/reviewModel').default;
    } catch (modelError) {
      console.error("Error loading Review model:", modelError);
      return NextResponse.json({ 
        success: false, 
        message: "Review system is not fully set up. Please contact administrator." 
      }, { status: 500 });
    }
    
    // Create new review
    const review = await Review.create({
      paper: paperId,
      reviewer: session.user.id,
      feedback,
      rating,
      status,
      filePath
    });
    
    // Update paper status and add review to paper's reviews array
    paper.reviews.push(review._id);
    paper.status = status;
    await paper.save();
    
    // Send email notifications
    try {
      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/sendMail/feedbackAlert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '' // Forward cookies for auth
        },
        body: JSON.stringify({
          reviewId: review._id.toString(),
          paperId: paper._id.toString(),
          decision: status
        }),
      });
      
      if (!emailResponse.ok) {
        console.error("Failed to send email notifications, but review was submitted successfully");
      } else {
        console.log("Email notifications sent successfully for review submission");
      }
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
    }
    
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