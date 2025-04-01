import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has author role
    if (!session || session.user.role !== "author") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only authors can access their papers" 
      }, { status: 401 });
    }
    
    await connectDB();
    
    // First find the user by email to get the MongoDB _id
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }
    
    // Get the paper ID from the query parameters if provided
    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get('id');
    
    // Build the query
    const query = { author: user._id };
    if (paperId) {
      query._id = paperId;
    }
    
    console.log("Fetching papers with query:", JSON.stringify(query));
    
    // Fetch papers authored by the current user
    const papers = await Paper.find(query)
      .populate('reviewer', 'name email')
      .populate('conferenceId', 'name')
      .populate({
        path: 'reviews',
        select: 'feedback rating status'
      })
      .sort({ createdAt: -1 })
      .lean() || [];
    
    console.log(`Found ${papers.length} papers for user ${user._id}`);
    
    // If fetching a specific paper and it's not found
    if (paperId && papers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found or you don't have permission to access it" 
      }, { status: 404 });
    }
    
    // Format papers for frontend consumption - handle empty papers array
    const formattedPapers = papers.map(paper => ({
      id: paper._id.toString(),
      title: paper.title,
      abstract: paper.abstract,
      fileUrl: paper.fileUrl,
      submissionDate: new Date(paper.createdAt).toLocaleDateString(),
      lastUpdated: new Date(paper.updatedAt).toLocaleDateString(),
      status: paper.status,
      conference: paper.conferenceId ? paper.conferenceId.name : "No Conference",
      conferenceId: paper.conferenceId ? paper.conferenceId._id.toString() : null,
      hasReviewer: !!paper.reviewer,
      reviewer: paper.reviewer ? {
        id: paper.reviewer._id.toString(),
        name: paper.reviewer.name
      } : null,
      reviews: (paper.reviews || []).map(review => ({
        id: review._id.toString(),
        feedback: review.feedback,
        rating: review.rating,
        status: review.status
      }))
    }));
    
    // Calculate statistics - all zeros if no papers
    const stats = {
      totalSubmissions: papers.length,
      pending: papers.filter(p => p.status === "Pending").length,
      underReview: papers.filter(p => p.status === "Under Review").length,
      accepted: papers.filter(p => p.status === "Accepted").length,
      rejected: papers.filter(p => p.status === "Rejected").length,
      resubmitted: papers.filter(p => p.status === "Resubmitted").length,
      finalSubmitted: papers.filter(p => p.status === "FinalSubmitted").length
    };
    
    return NextResponse.json({ 
      success: true, 
      papers: formattedPapers,
      stats
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching author papers:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch papers" 
    }, { status: 500 });
  }
} 