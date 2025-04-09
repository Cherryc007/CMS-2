import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Review from "@/models/reviewModel";
import Paper from "@/models/paperModel";
import User from "@/models/userModel";
import { sendEmail } from "@/lib/mailUtils";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    const { reviewId, paperId } = await request.json();

    if (!reviewId || !paperId) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    await connectDB();

    // Get review, paper, and admin details
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

    // Find admin users
    const admins = await User.find({ role: "admin" }, 'email');
    const adminEmails = admins.map(admin => admin.email);

    if (adminEmails.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No admin users found" 
      }, { status: 404 });
    }

    // Send email to admins
    const adminEmailContent = {
      to: adminEmails,
      subject: `New Review Submission for Paper: ${review.paper.title}`,
      html: `
        <h2>New Review Submission Requires Your Approval</h2>
        <p>A new review has been submitted and requires your approval.</p>
        <h3>Details:</h3>
        <ul>
          <li><strong>Paper:</strong> ${review.paper.title}</li>
          <li><strong>Conference:</strong> ${review.paper.conferenceId.name}</li>
          <li><strong>Author:</strong> ${review.paper.author.name}</li>
          <li><strong>Reviewer:</strong> ${review.reviewer.name}</li>
          <li><strong>Recommendation:</strong> ${review.recommendation}</li>
          <li><strong>Score:</strong> ${review.score}/5</li>
        </ul>
        <p>Please log in to the admin dashboard to review and approve this submission.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/admin/review-approval">Go to Review Approval Dashboard</a></p>
      `
    };

    // Send email to reviewer
    const reviewerEmailContent = {
      to: review.reviewer.email,
      subject: `Review Submission Confirmation - ${review.paper.title}`,
      html: `
        <h2>Review Submission Confirmation</h2>
        <p>Your review for the following paper has been submitted successfully:</p>
        <h3>Paper Details:</h3>
        <ul>
          <li><strong>Title:</strong> ${review.paper.title}</li>
          <li><strong>Conference:</strong> ${review.paper.conferenceId.name}</li>
        </ul>
        <p>Your review is currently pending admin approval. You will be notified once it has been approved.</p>
        <p>Thank you for your contribution!</p>
      `
    };

    // Send emails
    await Promise.all([
      sendEmail(adminEmailContent),
      sendEmail(reviewerEmailContent)
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Email notifications sent successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("Error sending review submission alerts:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to send email notifications" 
    }, { status: 500 });
  }
} 