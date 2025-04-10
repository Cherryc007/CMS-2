import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Paper from "@/models/paperModel";
import Review from "@/models/reviewModel";
import User from "@/models/userModel";
import connectDB from "@/lib/connectDB";
import transporter from "@/lib/nodemailer";

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Admin access required" 
      }, { status: 401 });
    }

    await connectDB();

    const { paperId, verdict } = await request.json();

    if (!paperId || !verdict) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper ID and verdict are required" 
      }, { status: 400 });
    }

    // Find the paper
    const paper = await Paper.findById(paperId)
      .populate('author', 'name email')
      .populate('conferenceId', 'title')
      .populate('reviewers', 'name email');

    if (!paper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found" 
      }, { status: 404 });
    }

    // Update paper status based on verdict
    let newStatus;
    switch (verdict) {
      case "Accept":
        newStatus = "Accepted";
        break;
      case "Reject":
        newStatus = "Rejected";
        break;
      case "Revision":
        newStatus = "RevisionRequired";
        break;
      default:
        return NextResponse.json({ 
          success: false, 
          message: "Invalid verdict" 
        }, { status: 400 });
    }

    paper.status = newStatus;
    await paper.save();

    // Send email notifications
    try {
      // Email to author
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: paper.author.email,
        subject: `Paper Verdict: ${paper.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Paper Verdict</h2>
            <p>Hello ${paper.author.name},</p>
            <p>Your paper has been reviewed and a verdict has been reached:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Paper Title:</strong> ${paper.title}</p>
              <p><strong>Conference:</strong> ${paper.conferenceId.title}</p>
              <p><strong>Verdict:</strong> ${newStatus}</p>
            </div>
            <p>Please log in to your account to view the detailed feedback.</p>
            <p>Best regards,<br>The Conference Management Team</p>
          </div>
        `
      });

      // Email to reviewers
      const reviewerEmails = paper.reviewers.map(reviewer => ({
        from: process.env.EMAIL_FROM,
        to: reviewer.email,
        subject: `Paper Verdict: ${paper.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Paper Verdict</h2>
            <p>Hello ${reviewer.name},</p>
            <p>The paper you reviewed has reached a verdict:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Paper Title:</strong> ${paper.title}</p>
              <p><strong>Conference:</strong> ${paper.conferenceId.title}</p>
              <p><strong>Author:</strong> ${paper.author.name}</p>
              <p><strong>Verdict:</strong> ${newStatus}</p>
            </div>
            <p>Best regards,<br>The Conference Management Team</p>
          </div>
        `
      }));

      await Promise.all(reviewerEmails.map(email => transporter.sendMail(email)));
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Verdict updated successfully",
      data: {
        paper: {
          _id: paper._id,
          title: paper.title,
          status: paper.status
        }
      }
    });

  } catch (error) {
    console.error("Error in POST /api/admin/review-verdict:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to update verdict" 
    }, { status: 500 });
  }
} 