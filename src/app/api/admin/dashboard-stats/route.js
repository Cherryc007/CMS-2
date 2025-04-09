import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import Review from "@/models/reviewModel";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only admins can view dashboard stats" 
      }, { status: 401 });
    }

    await connectDB();

    // Get paper stats
    const papers = await Paper.find({});
    const totalPapers = papers.length;
    const underReview = papers.filter(p => p.status === "Under Review").length;
    const accepted = papers.filter(p => p.status === "Accepted").length;
    const rejected = papers.filter(p => p.status === "Rejected").length;

    // Get pending reviews count
    const pendingReviews = await Review.countDocuments({ 
      status: "Pending Admin Approval" 
    });

    return NextResponse.json({ 
      success: true, 
      stats: {
        totalPapers,
        underReview,
        accepted,
        rejected,
        pendingReviews
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch dashboard statistics" 
    }, { status: 500 });
  }
} 