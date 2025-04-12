import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { message: "Paper ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const paper = await Paper.findById(id)
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
      return NextResponse.json(
        { message: "Paper not found" },
        { status: 404 }
      );
    }

    // Format the paper data
    const formattedPaper = {
      _id: paper._id,
      title: paper.title,
      abstract: paper.abstract,
      keywords: paper.keywords,
      fileUrl: paper.fileUrl,
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

    return NextResponse.json({ paper: formattedPaper });
  } catch (error) {
    console.error("Error fetching paper details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 