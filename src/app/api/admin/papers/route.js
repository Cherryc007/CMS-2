import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import Conference from "@/models/conferenceModel";
import Review from "@/models/reviewModel";
import { connectDB } from "@/lib/connectDB";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Admin access required" 
      }, { status: 401 });
    }

    await connectDB();

    // Fetch all papers except FinalSubmitted ones
    const papers = await Paper.find({ status: { $ne: "FinalSubmitted" } })
      .select('title abstract status fileUrl author conference reviewers createdAt')
      .populate('author', 'name email')
      .populate('conference', 'title')
      .populate('reviewers', 'name email')
      .populate({
        path: 'reviews',
        select: 'status verdict comments createdAt',
        populate: {
          path: 'reviewer',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    // Get all reviewers
    const reviewers = await User.find({ role: "reviewer" })
      .select('name email')
      .sort({ name: 1 });

    // Calculate statistics
    const stats = {
      total: papers.length,
      underReview: papers.filter(p => p.status === "UnderReview").length,
      accepted: papers.filter(p => p.status === "Accepted").length,
      rejected: papers.filter(p => p.status === "Rejected").length,
      revisionRequired: papers.filter(p => p.status === "RevisionRequired").length
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
      reviewers: paper.reviewers,
      reviews: paper.reviews,
      createdAt: paper.createdAt,
      reviewerCount: paper.reviewers.length
    }));

    return NextResponse.json({
      success: true,
      data: {
        papers: formattedPapers,
        reviewers,
        stats
      }
    });

  } catch (error) {
    console.error("Error in GET /api/admin/papers:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch papers" 
    }, { status: 500 });
  }
} 