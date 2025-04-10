import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import Review from "@/models/reviewModel";
import connectDB from "@/lib/connectDB";
import transporter from "@/lib/nodemailer";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { paperId, reviewerId } = await request.json();
    if (!paperId || !reviewerId) {
      return NextResponse.json({ error: "Paper ID and Reviewer ID are required" }, { status: 400 });
    }

    await connectDB();

    // Get paper and reviewer details
    const paper = await Paper.findById(paperId)
      .populate('author', 'name email')
      .populate('conferenceId', 'name')
      .lean();

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    const reviewer = await User.findById(reviewerId);
    if (!reviewer || reviewer.role !== "reviewer") {
      return NextResponse.json({ error: "Invalid reviewer" }, { status: 400 });
    }

    // Check if reviewer is already assigned
    if (paper.reviewers.some(r => r.toString() === reviewerId)) {
      return NextResponse.json({ error: "Reviewer already assigned to this paper" }, { status: 400 });
    }

    // Update paper with new reviewer
    const updatedPaper = await Paper.findByIdAndUpdate(
      paperId,
      {
        $push: { reviewers: reviewerId },
        $set: { status: 'Under Review' }
      },
      { new: true }
    ).populate('reviewers', 'name email');

    // Create new review document
    const review = new Review({
      paper: paperId,
      reviewer: reviewerId,
      status: 'Pending Admin Approval'
    });
    await review.save();

    // Send email notifications
    try {
      // Email to reviewer
      const reviewerMailOptions = {
        from: process.env.GMAIL_ID,
        to: reviewer.email,
        subject: `New Paper Assignment: ${paper.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">New Paper Assignment</h2>
            <p>Dear ${reviewer.name},</p>
            <p>You have been assigned to review the following paper:</p>
            <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
              <h3 style="margin-top: 0; color: #374151;">Paper Details:</h3>
              <p style="margin-bottom: 5px;"><strong>Title:</strong> ${paper.title}</p>
              <p style="margin-bottom: 5px;"><strong>Conference:</strong> ${paper.conferenceId.name}</p>
              <p style="margin-bottom: 5px;"><strong>Author:</strong> ${paper.author.name}</p>
              <p style="margin-bottom: 0;"><strong>Assignment Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Please log in to your account to access and review the paper.</p>
            <p>Best regards,<br />Conference Management Team</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `
      };

      // Email to author
      const authorMailOptions = {
        from: process.env.GMAIL_ID,
        to: paper.author.email,
        subject: `Reviewer Assigned to Your Paper: ${paper.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Reviewer Assigned</h2>
            <p>Dear ${paper.author.name},</p>
            <p>A reviewer has been assigned to your paper:</p>
            <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
              <h3 style="margin-top: 0; color: #374151;">Paper Details:</h3>
              <p style="margin-bottom: 5px;"><strong>Title:</strong> ${paper.title}</p>
              <p style="margin-bottom: 5px;"><strong>Reviewer:</strong> ${reviewer.name}</p>
              <p style="margin-bottom: 5px;"><strong>Status:</strong> Under Review</p>
              <p style="margin-bottom: 0;"><strong>Updated On:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>You will be notified when the review is completed.</p>
            <p>Best regards,<br />Conference Management Team</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `
      };

      // Send emails in parallel
      await Promise.all([
        transporter.sendMail(reviewerMailOptions),
        transporter.sendMail(authorMailOptions)
      ]);

      console.log('Review assignment emails sent successfully');
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      paper: {
        _id: updatedPaper._id.toString(),
        title: updatedPaper.title,
        status: updatedPaper.status,
        reviewers: updatedPaper.reviewers.map(r => ({
          _id: r._id.toString(),
          name: r.name,
          email: r.email
        }))
      }
    });
  } catch (error) {
    console.error('Error in POST /api/admin/assignReviewer:', error);
    return NextResponse.json(
      { error: "Internal Server Error", details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
} 