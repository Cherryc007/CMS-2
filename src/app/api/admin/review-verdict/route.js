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

    const { reviewId, verdict } = await request.json();

    if (!reviewId || !verdict) {
      return NextResponse.json({ 
        success: false, 
        message: "Review ID and verdict are required" 
      }, { status: 400 });
    }

    // Find the review with populated references
    const review = await Review.findById(reviewId)
      .populate('paper')
      .populate('reviewer', 'name email');

    if (!review) {
      return NextResponse.json({ 
        success: false, 
        message: "Review not found" 
      }, { status: 404 });
    }

    // Update review status based on verdict
    switch (verdict.toLowerCase()) {
      case "approved":
        review.status = "Approved";
        break;
      case "rejected":
        review.status = "Rejected";
        break;
      case "revision":
        review.status = "Revision Required";
        break;
      default:
        return NextResponse.json({ 
          success: false, 
          message: "Invalid verdict" 
        }, { status: 400 });
    }

    review.adminVerdict = true;
    review.adminVerdictAt = new Date();
    await review.save();

    // Update paper status if review is approved
    if (verdict.toLowerCase() === "approved") {
      const paper = review.paper;
      paper.status = "Under Review";
      await paper.save();
    }

    // Send email notifications
    try {
      // Email to reviewer
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: review.reviewer.email,
        subject: `Review Verdict - ${review.paper.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Review Verdict</h2>
            <p>Hello ${review.reviewer.name},</p>
            <p>Your review has been ${verdict.toLowerCase()} by the admin.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Paper Title:</strong> ${review.paper.title}</p>
              <p><strong>Verdict:</strong> ${verdict}</p>
              ${verdict.toLowerCase() === "revision" ? "<p>Please revise your review based on the admin's feedback.</p>" : ""}
            </div>
            <p>Please log in to your dashboard to view more details.</p>
            <p>Best regards,<br>The Conference Management Team</p>
          </div>
        `
      });

    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Review verdict updated successfully",
      data: {
        review: {
          _id: review._id,
          status: review.status,
          adminVerdict: review.adminVerdict,
          adminVerdictAt: review.adminVerdictAt
        }
      }
    });

  } catch (error) {
    console.error("Error in POST /api/admin/review-verdict:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to update review verdict" 
    }, { status: 500 });
  }
} 