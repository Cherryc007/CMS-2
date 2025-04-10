import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import Conference from "@/models/conferenceModel";
import Review from "@/models/reviewModel";
import connectDB from "@/lib/connectDB";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // Get all papers with their related data
    const papers = await Paper.find({ status: { $ne: "FinalSubmitted" } })
      .populate('author', 'name email')
      .populate('conferenceId', 'name')
      .populate('reviewers', 'name email')
      .populate({
        path: 'reviews',
        select: 'status recommendation score',
        populate: {
          path: 'reviewer',
          select: 'name email'
        }
      })
      .select('title abstract status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    // Get all reviewers
    const reviewers = await User.find({ role: "reviewer" })
      .select('name email')
      .lean();

    // Calculate statistics
    const stats = {
      total: papers.length,
      underReview: papers.filter(p => p.status === "Under Review").length,
      accepted: papers.filter(p => p.status === "Accepted").length,
      rejected: papers.filter(p => p.status === "Rejected").length,
      revisionRequired: papers.filter(p => p.status === "Revision Required").length
    };

    // Format the response
    const formattedPapers = papers.map(paper => ({
      _id: paper._id.toString(),
      title: paper.title,
      abstract: paper.abstract,
      status: paper.status,
      createdAt: paper.createdAt,
      updatedAt: paper.updatedAt,
      author: {
        _id: paper.author._id.toString(),
        name: paper.author.name,
        email: paper.author.email
      },
      conference: paper.conferenceId ? {
        _id: paper.conferenceId._id.toString(),
        name: paper.conferenceId.name
      } : null,
      reviewers: paper.reviewers.map(reviewer => ({
        _id: reviewer._id.toString(),
        name: reviewer.name,
        email: reviewer.email
      })),
      reviews: paper.reviews.map(review => ({
        _id: review._id.toString(),
        status: review.status,
        recommendation: review.recommendation,
        score: review.score,
        reviewer: {
          _id: review.reviewer._id.toString(),
          name: review.reviewer.name,
          email: review.reviewer.email
        }
      }))
    }));

    return NextResponse.json({
      papers: formattedPapers,
      reviewers: reviewers.map(reviewer => ({
        _id: reviewer._id.toString(),
        name: reviewer.name,
        email: reviewer.email
      })),
      stats
    });
  } catch (error) {
    console.error('Error in GET /api/admin/papers:', error);
    return NextResponse.json(
      { error: "Internal Server Error", details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
} 