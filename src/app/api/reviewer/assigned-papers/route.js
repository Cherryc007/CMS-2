import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    
    // Strict RBAC check
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Authentication required" 
      }, { status: 401 });
    }

    await connectDB();

    // Verify user exists and has reviewer role
    const user = await User.findOne({ 
      email: session.user.email 
    }).select('_id email name role').lean();

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    // Check for reviewer role
    if (user.role !== "reviewer") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Reviewer access required" 
      }, { status: 403 });
    }

    console.log(`Reviewer ${user.email} fetching assigned papers`);

    // Get all papers assigned to this reviewer
    const papers = await Paper.find({
      reviewers: user._id,
      status: { $in: ["Under Review", "Revision Required", "Accepted", "Rejected"] }
    })
    .populate('author', 'name email')
    .populate('conferenceId', 'name startDate endDate')
    .populate({
      path: 'reviews',
      match: { reviewer: user._id },
      select: 'status comments recommendation score submittedAt'
    })
    .sort({ submittedAt: -1 })
    .lean();

    // Calculate review statistics
    const stats = {
      totalAssigned: papers.length,
      pendingReview: papers.filter(p => !p.reviews?.length).length,
      reviewed: papers.filter(p => p.reviews?.length > 0).length,
      underRevision: papers.filter(p => p.status === "Revision Required").length,
      accepted: papers.filter(p => p.status === "Accepted").length,
      rejected: papers.filter(p => p.status === "Rejected").length,
      averageScore: papers.reduce((acc, p) => {
        const score = p.reviews?.[0]?.score;
        return score ? acc + score : acc;
      }, 0) / (papers.filter(p => p.reviews?.[0]?.score).length || 1)
    };

    // Format papers for response
    const formattedPapers = papers.map(paper => ({
      _id: paper._id.toString(),
      title: paper.title,
      abstract: paper.abstract,
      status: paper.status,
      fileUrl: paper.fileUrl,
      submittedAt: paper.submittedAt,
      author: paper.author ? {
        _id: paper.author._id.toString(),
        name: paper.author.name,
        email: paper.author.email
      } : null,
      conference: paper.conferenceId ? {
        _id: paper.conferenceId._id.toString(),
        name: paper.conferenceId.name,
        startDate: paper.conferenceId.startDate,
        endDate: paper.conferenceId.endDate
      } : null,
      myReview: paper.reviews?.[0] ? {
        status: paper.reviews[0].status,
        comments: paper.reviews[0].comments,
        recommendation: paper.reviews[0].recommendation,
        score: paper.reviews[0].score,
        submittedAt: paper.reviews[0].submittedAt
      } : null
    }));

    return NextResponse.json({ 
      success: true,
      papers: formattedPapers,
      stats,
      reviewer: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching assigned papers:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch assigned papers",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 