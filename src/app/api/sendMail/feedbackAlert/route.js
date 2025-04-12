import { NextResponse } from "next/server";
import transporter from "@/lib/nodemailer";
import connectDB from "@/lib/connectDB";
import User from "@/models/userModel";
import Paper from "@/models/paperModel";
import Review from "@/models/reviewModel";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    
    // This endpoint should only be called from other server-side API routes
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized request" 
      }, { status: 401 });
    }
    
    const { reviewId, paperId, decision } = await request.json();
    
    if (!reviewId || !paperId || !decision) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Get review details
    let review;
    try {
      const Review = require('@/models/reviewModel').default;
      review = await Review.findById(reviewId);
      
      if (!review) {
        return NextResponse.json({ 
          success: false, 
          message: "Review not found" 
        }, { status: 404 });
      }
    } catch (reviewError) {
      console.error("Error fetching review:", reviewError);
      // Continue with limited data if the review model is missing
      review = { rating: "Not available" };
    }
    
    // Get paper details with author and conference
    const paper = await Paper.findById(paperId)
      .populate('conference')
      .populate('author', 'name email');
    
    if (!paper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found" 
      }, { status: 404 });
    }
    
    // Get admin users
    const admins = await User.find({ role: "admin" }).select("email name");
    
    if (!admins || admins.length === 0) {
      console.warn("No admin users found to notify about review");
    }
    
    // Email to author
    const authorMailOptions = {
      from: process.env.GMAIL_ID,
      to: paper.author.email,
      subject: `Review Feedback for Your Paper - ${paper.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Review Feedback Available</h2>
          <p>Dear ${paper.author.name},</p>
          <p>The review for your paper <strong>"${paper.title}"</strong> has been completed.</p>
          <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
            <h3 style="margin-top: 0; color: #374151;">Paper Details:</h3>
            <p style="margin-bottom: 5px;"><strong>Title:</strong> ${paper.title}</p>
            <p style="margin-bottom: 5px;"><strong>Conference:</strong> ${paper.conference ? paper.conference.name : 'Not specified'}</p>
            <p style="margin-bottom: 5px;"><strong>Decision:</strong> <span style="color: ${decision === 'Accepted' ? '#10b981' : decision === 'Rejected' ? '#ef4444' : '#6366f1'};">${decision}</span></p>
            <p style="margin-bottom: 0;"><strong>Updated On:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>Please log in to your author dashboard to view the detailed feedback.</p>
          <p>Best regards,<br />Conference Management Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
    
    // Email to admins
    if (admins.length > 0) {
      const adminEmails = admins.map(admin => admin.email);
      
      const adminMailOptions = {
        from: process.env.GMAIL_ID,
        to: adminEmails.join(", "),
        subject: `Review Completed - ${paper.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Review Completed</h2>
            <p>A paper review has been completed by ${paper.reviewer ? paper.reviewer.name : 'a reviewer'}.</p>
            <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
              <h3 style="margin-top: 0; color: #374151;">Review Details:</h3>
              <p style="margin-bottom: 5px;"><strong>Paper Title:</strong> ${paper.title}</p>
              <p style="margin-bottom: 5px;"><strong>Author:</strong> ${paper.author.name}</p>
              <p style="margin-bottom: 5px;"><strong>Reviewer:</strong> ${paper.reviewer ? paper.reviewer.name : 'Not specified'}</p>
              <p style="margin-bottom: 5px;"><strong>Conference:</strong> ${paper.conference ? paper.conference.name : 'Not specified'}</p>
              <p style="margin-bottom: 5px;"><strong>Decision:</strong> <span style="color: ${decision === 'Accepted' ? '#10b981' : decision === 'Rejected' ? '#ef4444' : '#6366f1'};">${decision}</span></p>
              <p style="margin-bottom: 5px;"><strong>Rating:</strong> ${review.rating}/5</p>
              <p style="margin-bottom: 0;"><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Please log in to the admin dashboard to view the full review details.</p>
            <p>Conference Management System</p>
          </div>
        `
      };
      
      try {
        await transporter.sendMail(adminMailOptions);
        console.log('Admin notification email sent successfully');
      } catch (err) {
        console.error('Error sending admin notification email:', err);
      }
    }
    
    try {
      await transporter.sendMail(authorMailOptions);
      console.log('Author feedback email sent successfully');
      
      return NextResponse.json({ 
        success: true, 
        message: "Email notifications sent successfully"
      }, { status: 200 });
    } catch (err) {
      console.error('Error sending author feedback email:', err);
      return NextResponse.json({ 
        success: false, 
        message: "Error sending email notifications"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error in feedback alert:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to send email notifications"
    }, { status: 500 });
  }
} 