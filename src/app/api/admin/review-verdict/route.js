import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
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

    const { reviewId, verdict } = await request.json();

    if (!reviewId || !verdict) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Get review details with populated references
    const review = await Review.findById(reviewId)
      .populate('reviewer', 'name email')
      .populate({
        path: 'paper',
        select: 'title author conferenceId',
        populate: [
          { path: 'author', select: 'name email' },
          { path: 'conferenceId', select: 'name' }
        ]
      });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Update review status
    review.status = verdict;
    await review.save();

    // Prepare verdict message
    const getVerdictMessage = () => {
      switch (verdict) {
        case "approved":
          return "Your review has been approved and will be shared with the author.";
        case "rejected":
          return "Your review requires some changes before it can be approved.";
        case "revision":
          return "Please revise your review based on the admin's feedback.";
        default:
          return "Your review status has been updated.";
      }
    };

    // Send email to reviewer
    const reviewerMailOptions = {
      from: process.env.GMAIL_ID,
      to: review.reviewer.email,
      subject: `Review Verdict - ${review.paper.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Review Verdict Update</h2>
          <p>${getVerdictMessage()}</p>
          <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
            <h3 style="margin-top: 0; color: #374151;">Paper Details:</h3>
            <p style="margin-bottom: 5px;"><strong>Title:</strong> ${review.paper.title}</p>
            <p style="margin-bottom: 5px;"><strong>Conference:</strong> ${review.paper.conferenceId.name}</p>
            <p style="margin-bottom: 5px;"><strong>Verdict:</strong> ${verdict.charAt(0).toUpperCase() + verdict.slice(1)}</p>
            <p style="margin-bottom: 0;"><strong>Updated On:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>Please log in to your dashboard to view more details.</p>
          <p>Best regards,<br />Conference Management Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    // If review is approved, notify the author
    if (verdict === "approved") {
      const authorMailOptions = {
        from: process.env.GMAIL_ID,
        to: review.paper.author.email,
        subject: `New Review Available - ${review.paper.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">New Review Available</h2>
            <p>Dear ${review.paper.author.name},</p>
            <p>A new review is available for your paper:</p>
            <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
              <h3 style="margin-top: 0; color: #374151;">Paper Details:</h3>
              <p style="margin-bottom: 5px;"><strong>Title:</strong> ${review.paper.title}</p>
              <p style="margin-bottom: 5px;"><strong>Conference:</strong> ${review.paper.conferenceId.name}</p>
              <p style="margin-bottom: 5px;"><strong>Recommendation:</strong> ${review.recommendation}</p>
              <p style="margin-bottom: 5px;"><strong>Score:</strong> ${review.score}/5</p>
              <p style="margin-bottom: 0;"><strong>Review Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Please log in to your dashboard to view the complete review.</p>
            <p>Best regards,<br />Conference Management Team</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `
      };

      // Send both emails
      await Promise.all([
        transporter.sendMail(reviewerMailOptions),
        transporter.sendMail(authorMailOptions)
      ]);
    } else {
      // Only send email to reviewer
      await transporter.sendMail(reviewerMailOptions);
    }

    return NextResponse.json({
      success: true,
      review: {
        _id: review._id.toString(),
        status: review.status,
        paper: {
          _id: review.paper._id.toString(),
          title: review.paper.title
        }
      }
    });

  } catch (error) {
    console.error("Error in POST /api/admin/review-verdict:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
} 