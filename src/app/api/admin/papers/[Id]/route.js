import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const paperId = params.id;

    if (!paperId) {
      return NextResponse.json(
        { message: "Paper ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Find the paper with author and conference details
    const paper = await db.collection("papers").aggregate([
      { $match: { _id: paperId } },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      {
        $lookup: {
          from: "conferences",
          localField: "conferenceId",
          foreignField: "_id",
          as: "conference"
        }
      },
      { $unwind: "$conference" },
      {
        $lookup: {
          from: "users",
          localField: "reviewers",
          foreignField: "_id",
          as: "reviewers"
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          abstract: 1,
          keywords: 1,
          status: 1,
          fileUrl: 1,
          submissionDate: 1,
          "author.id": "$author._id",
          "author.name": "$author.name",
          "author.email": "$author.email",
          "conference.id": "$conference._id",
          "conference.name": "$conference.name",
          "reviewers.id": "$reviewers._id",
          "reviewers.name": "$reviewers.name",
          "reviewers.status": "$reviewers.status"
        }
      }
    ]).toArray();

    if (!paper || paper.length === 0) {
      return NextResponse.json(
        { message: "Paper not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ paper: paper[0] });
  } catch (error) {
    console.error("Error fetching paper details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 