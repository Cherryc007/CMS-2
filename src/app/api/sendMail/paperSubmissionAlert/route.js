import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Conference from "@/models/conferenceModel";
import { transporter } from "@/lib/nodemailer";
import User from "@/models/userModel";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    
    // This endpoint should only be called from other server-side API routes
    // We'll check session existence but not require specific roles
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized request" 
      }, { status: 401 });
    }
    
    const { paperTitle, authorId, authorEmail, authorName, Conferenceonference } = await request.json();
    
    if (!paperTitle || !authorId || !authorEmail || !conferenceId) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Get conference details for the email
    const conference = await Conference.findById(conferenceId);
    if (!conference) {
      return NextResponse.json({ 
        success: false, 
        message: "Conference not found" 
      }, { status: 404 });
    }
    
    // Get admin emails to notify them about the submission
    const admins = await User.find({ role: "admin" }).select("email name");
    
    if (!admins || admins.length === 0) {
      console.warn("No admin users found to notify about paper submission");
    }
    
    // Send email to author
    const authorMailOptions = {
      from: process.env.GMAIL_ID,
      to: authorEmail,
      subject: `Paper Submission Confirmation - ${conference.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Paper Submission Confirmation</h2>
          <p>Dear ${authorName || "Author"},</p>
          <p>Thank you for submitting your paper <strong>"${paperTitle}"</strong> to <strong>${conference.name}</strong>.</p>
          <p>Your submission has been received and is now pending review. You'll receive further notifications as your paper progresses through the review process.</p>
          <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
            <h3 style="margin-top: 0; color: #374151;">Submission Details:</h3>
            <p style="margin-bottom: 5px;"><strong>Conference:</strong> ${conference.name}</p>
            <p style="margin-bottom: 5px;"><strong>Paper Title:</strong> ${paperTitle}</p>
            <p style="margin-bottom: 5px;"><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin-bottom: 0;"><strong>Current Status:</strong> Pending Review</p>
          </div>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br />Conference Management Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
    
    // Send email to admins
    const adminEmails = admins.map(admin => admin.email);
    
    if (adminEmails.length > 0) {
      const adminMailOptions = {
        from: process.env.GMAIL_ID,
        to: adminEmails.join(", "),
        subject: `New Paper Submission - ${paperTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">New Paper Submission</h2>
            <p>A new paper has been submitted to ${conference.name}.</p>
            <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
              <h3 style="margin-top: 0; color: #374151;">Submission Details:</h3>
              <p style="margin-bottom: 5px;"><strong>Paper Title:</strong> ${paperTitle}</p>
              <p style="margin-bottom: 5px;"><strong>Author:</strong> ${authorName || authorEmail}</p>
              <p style="margin-bottom: 5px;"><strong>Conference:</strong> ${conference.name}</p>
              <p style="margin-bottom: 5px;"><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Please log in to the admin dashboard to review this submission and assign a reviewer.</p>
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
      console.log('Author confirmation email sent successfully');
      
      return NextResponse.json({ 
        success: true, 
        message: "Email notifications sent successfully"
      }, { status: 200 });
    } catch (err) {
      console.error('Error sending author confirmation email:', err);
      return NextResponse.json({ 
        success: false, 
        message: "Error sending email notifications"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error in paper submission alert:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to send email notifications"
    }, { status: 500 });
  }
} 