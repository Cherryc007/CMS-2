import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has reviewer role
    if (!session || session.user.role !== "reviewer") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only reviewers can access assigned papers" 
      }, { status: 401 });
    }
    
    await connectDB();
    
    // Fetch only papers assigned to the current reviewer
    const papers = await Paper.find({ 
      reviewer: session.user.id 
    })
    .populate('author', 'name email')
    .populate('conferenceId', 'name')
    .lean();
    
    // Format papers for frontend consumption
    const formattedPapers = papers.map(paper => ({
      id: paper._id.toString(),
      title: paper.title,
      abstract: paper.abstract,
      author: paper.author ? paper.author.name : "Unknown Author",
      submissionDate: new Date(paper.createdAt).toLocaleDateString(),
      status: paper.status,
      conference: paper.conferenceId ? paper.conferenceId.name : "No Conference",
      hasReviewed: paper.reviews && paper.reviews.length > 0,
    }));
    
    return NextResponse.json({ 
      success: true, 
      papers: formattedPapers
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching assigned papers:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch assigned papers" 
    }, { status: 500 });
  }
} 