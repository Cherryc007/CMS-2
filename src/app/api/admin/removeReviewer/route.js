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
    
    // Find the paper and check if the reviewerId matches the current reviewer
    const paper = await Paper.findById(paperId).lean();
    
    if (!paper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found" 
      }, { status: 404 });
    }
    
    if (!paper.reviewer || paper.reviewer.toString() !== reviewerId) {
      return NextResponse.json({ 
        success: false, 
        message: "This reviewer is not assigned to this paper" 
      }, { status: 400 });
    }
    
    // Remove the reviewer from the paper
    await Paper.findByIdAndUpdate(
      paperId,
      { 
        $unset: { reviewer: "" },
        status: "Pending"  // Reset to pending since it's no longer under review
      }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Reviewer removed successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error removing reviewer:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to remove reviewer" 
    }, { status: 500 });
  }
} 