import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Paper from "@/models/paperModel";
import Review from "@/models/reviewModel";
import User from "@/models/userModel";
import Conference from "@/models/conferenceModel";
import connectDB from "@/lib/connectDB";

export async function GET(request) {
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

    // Find papers assigned to the reviewer
    const assignedPapers = await Paper.find({
      reviewers: session.user.id
    })
    .select('title abstract status fileUrl conference createdAt')
    .populate('conference', 'name');

    // Get reviews by this reviewer
    const reviews = await Review.find({
      reviewer: session.user.id
    }).select('paper status');

    // Create a map of paper IDs to review status
    const reviewMap = new Map(
      reviews.map(review => [review.paper.toString(), review])
    );

    // Format the response
    const formattedPapers = assignedPapers.map(paper => ({
      _id: paper._id.toString(),
      title: paper.title,
      abstract: paper.abstract,
      status: paper.status,
      fileUrl: paper.fileUrl,
      conference: paper.conference ? {
        _id: paper.conference._id.toString(),
        name: paper.conference.name
      } : null,
      createdAt: paper.createdAt,
      hasReview: reviewMap.has(paper._id.toString())
    }));

    // Calculate statistics
    const stats = {
      totalAssigned: assignedPapers.length,
      pendingReviews: assignedPapers.length - reviews.length,
      completedReviews: reviews.length
    };

    return NextResponse.json({ 
      success: true, 
      papers: formattedPapers,
      stats
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching assigned papers:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch assigned papers" 
    }, { status: 500 });
  }
} 