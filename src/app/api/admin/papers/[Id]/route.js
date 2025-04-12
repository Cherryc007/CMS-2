import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import Conference from "@/models/conferenceModel";
import Review from "@/models/reviewModel";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Admin access required" 
      }, { status: 401 });
    }

    await connectDB();

    const paper = await Paper.findById(params.Id)
      .populate("author", "name email")
      .populate("conference", "name")
      .populate("reviewers", "name email")
      .populate({
        path: "reviews",
        populate: {
          path: "reviewer",
          select: "name email"
        }
      });

    if (!paper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found" 
      }, { status: 404 });
    }

    const formattedPaper = {
      id: paper._id.toString(),
      title: paper.title,
      abstract: paper.abstract,
      status: paper.status,
      submissionDate: paper.submissionDate,
      author: paper.author,
      conference: paper.conference,
      reviewers: paper.reviewers.map(reviewer => ({
        reviewer: reviewer.reviewer,
        status: reviewer.status,
        review: reviewer.review
      })),
      reviews: paper.reviews.map(review => ({
        reviewer: review.reviewer,
        review: review.review
      }))
    };

    return NextResponse.json({ 
      success: true, 
      paper: formattedPaper 
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/admin/papers/[Id]:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch paper details" 
    }, { status: 500 });
  }
} 