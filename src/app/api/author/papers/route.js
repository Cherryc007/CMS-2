import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import Conference from "@/models/conferenceModel";
import Review from "@/models/reviewModel";

export async function GET(request) {
  try {
    const session = await auth();
    
    // Strict RBAC check
    if (!session || session.user.role !== "author") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Author access required" 
      }, { status: 401 });
    }

    await connectDB();

    // Verify user exists
    const user = await User.findOne({ 
      email: session.user.email 
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    console.log(`Author ${user.email} fetching their papers`);

    // Get all papers by this author
    const papers = await Paper.find({ author: user._id })
      .populate('conference', 'name startDate endDate')
      .populate('reviewers', 'name email')
      .populate({
        path: 'reviews',
        match: { status: 'approved' }, // Only show approved reviews
        populate: {
          path: 'reviewer',
          select: 'name email'
        }
      })
      .sort({ submittedAt: -1 });

    // Calculate statistics
    const stats = {
      totalSubmissions: papers.length,
      pending: papers.filter(p => p.status === "Pending").length,
      underReview: papers.filter(p => p.status === "Under Review").length,
      accepted: papers.filter(p => p.status === "Accepted").length,
      rejected: papers.filter(p => p.status === "Rejected").length,
      revisionRequired: papers.filter(p => p.status === "Revision Required").length
    };

    // Format the papers for response
    const formattedPapers = papers.map(paper => ({
      _id: paper._id,
      title: paper.title,
      abstract: paper.abstract,
      status: paper.status,
      fileUrl: paper.fileUrl,
      submittedAt: paper.submittedAt,
      conference: {
        _id: paper.conference?._id,
        name: paper.conference?.name,
        startDate: paper.conference?.startDate,
        endDate: paper.conference?.endDate
      },
      reviewers: paper.reviewers?.map(reviewer => ({
        name: reviewer.name
      })) || [],
      reviews: paper.reviews?.map(review => ({
        _id: review._id,
        reviewer: {
          name: review.reviewer?.name
        },
        status: review.status,
        submittedAt: review.submittedAt
      })) || []
    }));

    return NextResponse.json({
      success: true,
      message: "Papers fetched successfully",
      data: {
        papers: formattedPapers,
        stats
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/author/papers:", {
      error: error.message,
      stack: error.stack,
      user: session?.user?.email || 'unknown'
    });
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch papers" 
    }, { status: 500 });
  }
} 