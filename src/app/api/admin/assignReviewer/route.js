import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import Review from "@/models/reviewModel";
import connectDB from "@/lib/connectDB";
import transporter from "@/lib/nodemailer";

export async function POST(request) {
  let session;
  try {
    session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Admin access required" 
      }, { status: 401 });
    }

    await connectDB();

    const { paperId, reviewerId } = await request.json();

    if (!paperId || !reviewerId) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper ID and Reviewer ID are required" 
      }, { status: 400 });
    }

    // Find the paper and reviewer
    const paper = await Paper.findById(paperId)
      .populate('author', 'name email')
      .populate('conference', 'name');
    
    const reviewer = await User.findById(reviewerId);

    if (!paper || !reviewer) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper or reviewer not found" 
      }, { status: 404 });
    }

    // Check if reviewer is already assigned
    if (paper.reviewers.some(reviewerId => reviewerId.toString() === reviewerId)) {
      return NextResponse.json({ 
        success: false, 
        message: "Reviewer is already assigned to this paper" 
      }, { status: 400 });
    }

    // Add reviewer to paper and update status
    const updatedPaper = await Paper.findByIdAndUpdate(
      paperId,
      { 
        $push: { reviewers: reviewerId },
        status: "Under Review"
      },
      { new: true }
    ).populate('reviewers', 'name email');

    // Send email notifications
    try {
      // Email to reviewer
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: reviewer.email,
        subject: "New Paper Assignment",
        html: `
          <h2>New Paper Assignment</h2>
          <p>You have been assigned to review a new paper:</p>
          <p><strong>Paper Title:</strong> ${paper.title}</p>
          <p><strong>Conference:</strong> ${paper.conference.name}</p>
          <p>Please log in to your account to access and review the paper.</p>
        `
      });

      // Email to author
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: paper.author.email,
        subject: "Reviewer Assigned to Your Paper",
        html: `
          <h2>Reviewer Assigned</h2>
          <p>A reviewer has been assigned to your paper:</p>
          <p><strong>Paper Title:</strong> ${paper.title}</p>
          <p><strong>Conference:</strong> ${paper.conference.name}</p>
          <p><strong>Reviewer:</strong> ${reviewer.name}</p>
        `
      });
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
      // Don't fail the request if email sending fails
    }

    return NextResponse.json({ 
      success: true, 
      message: "Reviewer assigned successfully",
      paper: updatedPaper,
      reviewer: {
        _id: reviewer._id,
        name: reviewer.name,
        email: reviewer.email
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in assignReviewer:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to assign reviewer" 
    }, { status: 500 });
  }
} 