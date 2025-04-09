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

    // Verify user exists and has admin role in database
    await connectDB();
    const user = await User.findOne({ 
      email: session.user.email 
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Admin access required" 
      }, { status: 403 });
    }

    // Get all papers except those with FinalSubmitted status
    const papers = await Paper.find({})
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

    // Get all users with reviewer role
    const reviewers = await User.find({ 
      role: "reviewer",
      isActive: true // Only get active reviewers
    }, 'name email');

    // Format the response
    const formattedPapers = papers.map(paper => ({
      _id: paper._id,
      title: paper.title,
      abstract: paper.abstract,
      status: paper.status,
      fileUrl: paper.fileUrl,
      submittedAt: paper.submittedAt,
      author: {
        _id: paper.author?._id,
        name: paper.author?.name,
        email: paper.author?.email
      },
      conference: {
        _id: paper.conferenceId?._id,
        name: paper.conferenceId?.name,
        startDate: paper.conferenceId?.startDate,
        endDate: paper.conferenceId?.endDate
      },
      reviewers: paper.reviewers?.map(reviewer => ({
        _id: reviewer._id,
        name: reviewer.name,
        email: reviewer.email
      })) || [],
      reviews: paper.reviews?.map(review => ({
        _id: review._id,
        reviewer: {
          _id: review.reviewer?._id,
          name: review.reviewer?.name,
          email: review.reviewer?.email
        },
        status: review.status,
        submittedAt: review.submittedAt
      })) || []
    }));

    return NextResponse.json({ 
      success: true,
      papers: formattedPapers,
      reviewers: reviewers.map(reviewer => ({
        _id: reviewer._id,
        name: reviewer.name,
        email: reviewer.email
      }))
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching papers and reviewers:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch papers and reviewers" 
    }, { status: 500 });
  }
} 