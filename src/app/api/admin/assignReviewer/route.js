import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }
    
    const body = await request.json();
    const { paperId, reviewerId } = body;
    
    if (!paperId || !reviewerId) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper ID and reviewer ID are required" 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Update the paper with the assigned reviewer
    const updatedPaper = await Paper.findByIdAndUpdate(
      paperId,
      { 
        reviewer: reviewerId,
        status: "Under Review" 
      },
      { new: true }
    )
    .populate('reviewer', 'name email')
    .lean();
    
    if (!updatedPaper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Reviewer assigned successfully",
      reviewer: {
        id: updatedPaper.reviewer._id.toString(),
        name: updatedPaper.reviewer.name
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error assigning reviewer:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to assign reviewer" 
    }, { status: 500 });
  }
} 