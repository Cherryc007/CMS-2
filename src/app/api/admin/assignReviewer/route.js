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

    // Find the paper and reviewer with proper population
    const paper = await Paper.findById(paperId)
      .populate('author', 'name email')
      .populate('conference', 'name')
      .populate('reviewers', 'name email');
    
    const reviewer = await User.findById(reviewerId);

    if (!paper || !reviewer) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper or reviewer not found" 
      }, { status: 404 });
    }

    // Check if reviewer is already assigned
    if (paper.reviewers.some(r => r._id.toString() === reviewerId)) {
      return NextResponse.json({ 
        success: false, 
        message: "Reviewer is already assigned to this paper" 
      }, { status: 400 });
    }

    // Check if paper already has maximum reviewers
    if (paper.reviewers.length >= 3) {
      return NextResponse.json({ 
        success: false, 
        message: "Maximum number of reviewers (3) already assigned" 
      }, { status: 400 });
    }

    // Update paper with validation enabled
    const updatedPaper = await Paper.findByIdAndUpdate(
      paperId,
      { 
        $push: { reviewers: reviewerId },
        status: "Under Review"
      },
      { 
        new: true,
        runValidators: true 
      }
    ).populate('conference', 'name');

    if (!updatedPaper) {
      throw new Error("Failed to update paper");
    }

    // Create a new review document
    const review = new Review({
      paper: paperId,
      reviewer: reviewerId,
      status: "Pending",
      score: 0,
      recommendation: "",
      comments: "",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await review.save();

    // Send email notifications
    try {
      // Email to reviewer
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: reviewer.email,
        subject: "New Paper Assignment",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Paper Assignment</h2>
            <p>Hello ${reviewer.name},</p>
            <p>You have been assigned to review a new paper:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Paper Title:</strong> ${paper.title}</p>
              <p><strong>Conference:</strong> ${paper.conference.name}</p>
              <p><strong>Author:</strong> ${paper.author.name}</p>
            </div>
            <p>Please log in to your account to access and review the paper.</p>
            <p>Best regards,<br>The Conference Management Team</p>
          </div>
        `
      });

      // Email to author
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: paper.author.email,
        subject: "Reviewer Assigned to Your Paper",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Reviewer Assigned</h2>
            <p>Hello ${paper.author.name},</p>
            <p>A reviewer has been assigned to your paper:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Paper Title:</strong> ${paper.title}</p>
              <p><strong>Conference:</strong> ${paper.conference.name}</p>
              <p><strong>Reviewer:</strong> ${reviewer.name}</p>
            </div>
            <p>You will be notified when the review is completed.</p>
            <p>Best regards,<br>The Conference Management Team</p>
          </div>
        `
      });

    } catch (emailError) {
      console.error("Failed to send email notifications:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: "Reviewer assigned successfully",
      paper: updatedPaper,
      reviewer: {
        id: reviewer._id,
        name: reviewer.name,
        email: reviewer.email
      }
    });

  } catch (error) {
    console.error("Error in assignReviewer:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to assign reviewer" 
    }, { status: 500 });
  }
} 