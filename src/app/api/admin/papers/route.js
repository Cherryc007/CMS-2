import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import Conference from "@/models/conferenceModel";
import Review from "@/models/reviewModel";
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

    // Verify user exists and has admin role
    const user = await User.findOne({ 
      email: session.user.email 
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Admin access required" 
      }, { status: 403 });
    }

    // Get all papers with their relationships
    const papers = await Paper.find()
      .populate('author', 'name email')
      .populate('conferenceId', 'name startDate endDate')
      .populate('reviewers', 'name email')
      .populate({
        path: 'reviews',
        populate: {
          path: 'reviewer',
          select: 'name email'
        }
      })
      .sort({ submittedAt: -1 });

    console.log(`Admin ${user.email} fetched ${papers.length} papers`);

    // Get all active reviewers
    const reviewers = await User.find({ 
      role: "reviewer",
      isActive: true 
    }).select('name email').lean();

    console.log(`Found ${reviewers.length} active reviewers`);

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
      reviewers: (paper.reviewers || []).map(reviewer => ({
        _id: reviewer._id.toString(),
        name: reviewer.name,
        email: reviewer.email
      })),
      reviews: (paper.reviews || []).map(review => ({
        _id: review._id.toString(),
        reviewer: review.reviewer ? {
          _id: review.reviewer._id.toString(),
          name: review.reviewer.name,
          email: review.reviewer.email
        } : null,
        status: review.status,
        submittedAt: review.submittedAt
      }))
    }));

    // Format reviewers for response
    const formattedReviewers = reviewers.map(reviewer => ({
      _id: reviewer._id.toString(),
      name: reviewer.name,
      email: reviewer.email
    }));

    // Calculate statistics
    const stats = {
      totalPapers: papers.length,
      underReview: papers.filter(p => p.status === "Under Review").length,
      accepted: papers.filter(p => p.status === "Accepted").length,
      rejected: papers.filter(p => p.status === "Rejected").length,
      revisionRequired: papers.filter(p => p.status === "Revision Required").length,
      pendingAssignment: papers.filter(p => p.status === "Pending").length
    };

    return NextResponse.json({ 
      success: true,
      papers: formattedPapers,
      reviewers: formattedReviewers,
      stats
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching papers and reviewers:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch papers and reviewers" 
    }, { status: 500 });
  }
} 