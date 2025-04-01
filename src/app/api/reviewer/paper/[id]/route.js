import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
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
    
    const { id } = params;
    
    await connectDB();
    
    // Fetch paper with populated author and conference details
    const paper = await Paper.findById(id)
      .populate('author', 'name email')
      .populate('conferenceId', 'name')
      .lean();
    
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
    
    // Format paper data for frontend
    const formattedPaper = {
      id: paper._id.toString(),
      title: paper.title,
      abstract: paper.abstract,
      fileUrl: paper.fileUrl,
      author: paper.author ? paper.author.name : "Unknown Author",
      authorEmail: paper.author ? paper.author.email : "",
      conference: paper.conferenceId ? paper.conferenceId.name : "No Conference",
      submissionDate: new Date(paper.createdAt).toLocaleDateString(),
      status: paper.status
    };
    
    return NextResponse.json({ 
      success: true, 
      paper: formattedPaper 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching paper:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch paper details" 
    }, { status: 500 });
  }
} 