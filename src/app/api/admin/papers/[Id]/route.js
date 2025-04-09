import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import Conference from "@/models/conferenceModel";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    
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

    await connectDB();
    
    // Find the paper with author and conference details
    const paper = await Paper.findById(paperId)
      .populate('author', 'name email')
      .populate('conferenceId', 'name')
      .populate('reviewers', 'name status');

    if (!paper) {
      return NextResponse.json(
        { message: "Paper not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ paper });
  } catch (error) {
    console.error("Error fetching paper details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 