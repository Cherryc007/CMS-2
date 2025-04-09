import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Review from "@/models/reviewModel";
import nodemailer from "nodemailer";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only admins can send verdict notifications" 
      }, { status: 401 });
    }

    const { reviewId, verdict } = await request.json();

    if (!reviewId || !verdict) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
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
      return NextResponse.json({ 
        success: false, 
        message: "Review not found" 
      }, { status: 404 });
    }

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

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
    const reviewerEmailContent = {
      from: process.env.SMTP_FROM,
      to: review.reviewer.email,
      subject: `Review Verdict - ${review.paper.title}`,
      html: `
        <h2>Review Verdict Update</h2>
        <p>${getVerdictMessage()}</p>
        <h3>Paper Details:</h3>
        <ul>
          <li><strong>Title:</strong> ${review.paper.title}</li>
          <li><strong>Conference:</strong> ${review.paper.conferenceId.name}</li>
          <li><strong>Verdict:</strong> ${verdict.charAt(0).toUpperCase() + verdict.slice(1)}</li>
        </ul>
        <p>Please log in to your dashboard to view more details.</p>
      `
    };

    // If review is approved, notify the author
    if (verdict === "approved") {
      const authorEmailContent = {
        from: process.env.SMTP_FROM,
        to: review.paper.author.email,
        subject: `New Review Available - ${review.paper.title}`,
        html: `
          <h2>New Review Available</h2>
          <p>A new review is available for your paper:</p>
          <h3>Paper Details:</h3>
          <ul>
            <li><strong>Title:</strong> ${review.paper.title}</li>
            <li><strong>Conference:</strong> ${review.paper.conferenceId.name}</li>
            <li><strong>Recommendation:</strong> ${review.recommendation}</li>
            <li><strong>Score:</strong> ${review.score}/5</li>
          </ul>
          <p>Please log in to your dashboard to view the complete review.</p>
        `
      };

      // Send both emails
      await Promise.all([
        transporter.sendMail(reviewerEmailContent),
        transporter.sendMail(authorEmailContent)
      ]);
    } else {
      // Only send email to reviewer
      await transporter.sendMail(reviewerEmailContent);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Email notifications sent successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("Error sending review verdict alerts:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to send email notifications" 
    }, { status: 500 });
  }
} 