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
      status: { $in: ["UnderReview", "RevisionRequired"] }
    })
      .select('title abstract status fileUrl author conference createdAt')
      .populate('author', 'name email')
      .populate('conference', 'title')
      .populate({
        path: 'reviews',
        match: { reviewer: session.user.id },
        select: 'status verdict comments createdAt'
      })
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalAssigned: papers.length,
      pendingReviews: papers.filter(p => !p.reviews.length).length,
      underRevision: papers.filter(p => p.status === "RevisionRequired").length
    };

    // Format papers for response
    const formattedPapers = papers.map(paper => ({
      _id: paper._id,
      title: paper.title,
      abstract: paper.abstract,
      status: paper.status,
      fileUrl: paper.fileUrl,
      author: paper.author,
      conference: paper.conference,
      review: paper.reviews[0] || null,
      createdAt: paper.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        papers: formattedPapers,
        stats,
        reviewer: {
          name: reviewer.name,
          email: reviewer.email
        }
      }
    });

  } catch (error) {
    console.error("Error in GET /api/reviewer/assigned-papers:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch assigned papers" 
    }, { status: 500 });
  }
} 