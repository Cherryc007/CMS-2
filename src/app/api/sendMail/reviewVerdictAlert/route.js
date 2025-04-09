import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailUtils";
import Review from "@/models/reviewModel";
import Paper from "@/models/paperModel";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only admins can send verdict notifications" 
      }, { status: 401 });
    }

    const { reviewId, paperId, verdict, adminVerdict } = await request.json();

    // Get review and paper details
    const review = await Review.findById(reviewId)
      .populate('reviewer', 'name email')
      .populate({
        path: 'paper',
        select: 'title author',
        populate: {
          path: 'author',
          select: 'name email'
        }
      });

    if (!review) {
      return NextResponse.json({ 
        success: false, 
        message: "Review not found" 
      }, { status: 404 });
    }

    // Send email to reviewer
    await sendEmail({
      to: review.reviewer.email,
      subject: `Review Verdict for Paper: ${review.paper.title}`,
      html: `
        <h2>Review Verdict</h2>
        <p>Dear ${review.reviewer.name},</p>
        <p>Your review for the paper "${review.paper.title}" has been ${verdict} by the admin.</p>
        ${verdict === 'revision' ? '<p>Please revise your review based on the admin\'s feedback.</p>' : ''}
        <p>Thank you for your contribution to the review process.</p>
      `
    });

    // If review is approved, notify the author
    if (verdict === 'approved') {
      await sendEmail({
        to: review.paper.author.email,
        subject: `New Review Available for Your Paper: ${review.paper.title}`,
        html: `
          <h2>New Review Available</h2>
          <p>Dear ${review.paper.author.name},</p>
          <p>A new review is available for your paper "${review.paper.title}".</p>
          <p>Please log in to the system to view the review details.</p>
        `
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Email notifications sent successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error sending email notifications:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to send email notifications" 
    }, { status: 500 });
  }
} 