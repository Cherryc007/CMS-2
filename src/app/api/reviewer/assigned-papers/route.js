import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Paper from "@/models/paperModel";
import Review from "@/models/reviewModel";
import User from "@/models/userModel";
import Conference from "@/models/conferenceModel";
import { connectDB } from "@/lib/connectDB";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "reviewer") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Reviewer access required" 
      }, { status: 401 });
    }

    await connectDB();

    // Verify reviewer exists
    const reviewer = await User.findById(session.user.id);
    if (!reviewer) {
      return NextResponse.json({ 
        success: false, 
        message: "Reviewer not found" 
      }, { status: 404 });
    }

    // Fetch papers assigned to the reviewer
    const papers = await Paper.find({
      reviewers: session.user.id,
      status: { $in: ["Under Review", "Revision Required"] }
    })
      .select('title abstract status fileUrl filePath author conference createdAt')
      .populate('author', 'name email')
      .populate('conference', 'name')
      .populate({
        path: 'reviews',
        match: { reviewer: session.user.id },
        select: 'status comments recommendation score submittedAt'
      })
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalAssigned: papers.length,
      pendingReviews: papers.filter(p => !p.reviews.length).length,
      underRevision: papers.filter(p => p.status === "Revision Required").length
    };

    // Format papers for response
    const formattedPapers = papers.map(paper => ({
      id: paper._id.toString(),
      title: paper.title,
      abstract: paper.abstract,
      status: paper.status,
      fileUrl: paper.fileUrl,
      filePath: paper.filePath,
      author: paper.author ? {
        name: paper.author.name,
        email: paper.author.email
      } : null,
      conference: paper.conference ? paper.conference.name : "N/A",
      submissionDate: new Date(paper.createdAt).toLocaleDateString(),
      hasReview: paper.reviews && paper.reviews.length > 0,
      review: paper.reviews[0] || null
    }));

    return NextResponse.json({ 
      success: true, 
      papers: formattedPapers,
      stats 
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/reviewer/assigned-papers:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch assigned papers" 
    }, { status: 500 });
  }
} 