import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import Conference from "@/models/conferenceModel";
import Review from "@/models/reviewModel";
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
    .populate({
      path: 'reviews',
      match: { reviewer: session.user.id },
      select: '_id reviewer'
    })
    .lean();
    
    // Format papers for frontend consumption
    const formattedPapers = papers.map(paper => ({
      id: paper._id.toString(),
      title: paper.title,
      abstract: paper.abstract,
      fileUrl: paper.fileUrl || null,
      filePath: paper.filePath || null,
      author: paper.author ? paper.author.name : "Unknown Author",
      submissionDate: new Date(paper.createdAt).toLocaleDateString(),
      status: paper.status,
      conference: paper.conferenceId ? paper.conferenceId.name : "No Conference",
      // Set hasReview to true if there's a review by the current reviewer
      hasReview: paper.reviews && paper.reviews.length > 0,
      reviewers: paper.reviewer ? [{
        id: paper.reviewer._id.toString(),
        name: paper.reviewer.name
      }] : []
    }));
    
    console.log("Formatted papers:", formattedPapers.map(p => ({ 
      id: p.id, 
      title: p.title, 
      hasReview: p.hasReview 
    })));
    
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