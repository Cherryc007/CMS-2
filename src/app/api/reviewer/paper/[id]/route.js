import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import Conference from "@/models/conferenceModel";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has reviewer role
    if (!session || session.user.role !== "reviewer") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only reviewers can review papers" 
      }, { status: 401 });
    }
    
    const { id } = await params;
    
    await connectDB();
    
    // Fetch paper with populated author and conference details
    const paper = await Paper.findById(id)
      .populate('author', 'name email')
      .populate('conference', 'name')
      .lean();
    
    if (!paper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found" 
      }, { status: 404 });
    }
    
    // Check if the current user is assigned as reviewer
    if (!paper.reviewers || !paper.reviewers.some(reviewerId => reviewerId.toString() === session.user.id)) {
      return NextResponse.json({ 
        success: false, 
        message: "You are not assigned to review this paper" 
      }, { status: 403 });
    }
    
    // Format paper data for frontend
    const formattedPaper = {
      id: paper._id.toString(),
      title: paper.title,
      abstract: paper.abstract,
      fileUrl: paper.fileUrl,
      filePath: paper.filePath,
      author: paper.author ? paper.author.name : "Unknown Author",
      authorEmail: paper.author ? paper.author.email : "",
      conference: paper.conference ? paper.conference.name : "No Conference",
      submissionDate: new Date(paper.createdAt).toLocaleDateString(),
      status: paper.status
    };
    
    return NextResponse.json({ 
      success: true, 
      paper: formattedPaper 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in GET /api/reviewer/paper/[id]:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch paper details" 
    }, { status: 500 });
  }
} 