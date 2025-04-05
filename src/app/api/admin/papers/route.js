import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import Review from "@/models/reviewModel";
import Conference from "@/models/conferenceModel";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }
    
    await connectDB();
    
    // Fetch papers that are not in FinalSubmitted status
    // Populate author and reviewer fields to get their names
    const papers = await Paper.find({ 
      status: { $ne: "FinalSubmitted" } 
    })
    .populate('author', 'name email')
    .populate('reviewer', 'name email')
    .populate({
      path: 'reviews',
      select: 'feedback rating status'
    })
    .populate({
      path: 'conferenceId',
      select: 'name'
    })
    .lean();
    
    // Fetch users with reviewer role
    const reviewers = await User.find({ 
      role: "reviewer" 
    })
    .select('name email _id')
    .lean();
    
    // Format papers for frontend consumption
    const formattedPapers = papers.map(paper => ({
      id: paper._id.toString(),
      title: paper.title,
      abstract: paper.abstract,
      author: paper.author ? paper.author.name : "Unknown Author",
      authorId: paper.author ? paper.author._id.toString() : null,
      submissionDate: new Date(paper.createdAt).toLocaleDateString(),
      status: paper.status,
      conference: paper.conferenceId ? paper.conferenceId.name : "No Conference",
      conferenceId: paper.conferenceId ? paper.conferenceId._id.toString() : null,
      reviewers: paper.reviewer ? [{ 
        id: paper.reviewer._id.toString(), 
        name: paper.reviewer.name 
      }] : [],
      reviewCount: paper.reviews ? paper.reviews.length : 0
    }));
    
    // Format reviewers for frontend consumption
    const formattedReviewers = reviewers.map(reviewer => ({
      id: reviewer._id.toString(),
      name: reviewer.name,
      email: reviewer.email
    }));
    
    return NextResponse.json({ 
      success: true, 
      papers: formattedPapers, 
      reviewers: formattedReviewers 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching papers and reviewers:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch papers and reviewers" 
    }, { status: 500 });
  }
} 