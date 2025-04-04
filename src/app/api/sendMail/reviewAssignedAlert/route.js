import { NextResponse } from "next/server";
import transporter from "@/lib/nodemailer";
import connectDB from "@/lib/connectDB";
import User from "@/models/userModel";
import Paper from "@/models/paperModel";
import Conference from "@/models/conferenceModel";
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
    
    const { paperId, reviewerId, authorId } = await request.json();
    
    if (!paperId || !reviewerId || !authorId) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Get paper details
    const paper = await Paper.findById(paperId).populate('conferenceId');
    
    if (!paper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found" 
      }, { status: 404 });
    }
    
    // Get reviewer details
    const reviewer = await User.findById(reviewerId);
    
    if (!reviewer) {
      return NextResponse.json({ 
        success: false, 
        message: "Reviewer not found" 
      }, { status: 404 });
    }
    
    // Get author details
    const author = await User.findById(authorId);
    
    if (!author) {
      return NextResponse.json({ 
        success: false, 
        message: "Author not found" 
      }, { status: 404 });
    }
    
    // Email to reviewer
    const reviewerMailOptions = {
      from: process.env.GMAIL_ID,
      to: reviewer.email,
      subject: `New Paper Review Assignment - ${paper.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">New Review Assignment</h2>
          <p>Dear ${reviewer.name},</p>
          <p>You have been assigned to review a paper for ${paper.conferenceId ? paper.conferenceId.name : 'a conference'}.</p>
          <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
            <h3 style="margin-top: 0; color: #374151;">Paper Details:</h3>
            <p style="margin-bottom: 5px;"><strong>Title:</strong> ${paper.title}</p>
            <p style="margin-bottom: 5px;"><strong>Conference:</strong> ${paper.conferenceId ? paper.conferenceId.name : 'Not specified'}</p>
            <p style="margin-bottom: 0;"><strong>Assignment Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>Please log in to your reviewer dashboard to access the paper and submit your review. Your expertise and feedback are greatly appreciated.</p>
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
      to: author.email,
      subject: `Your Paper Status Update - ${paper.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Paper Status Update</h2>
          <p>Dear ${author.name},</p>
          <p>Your paper <strong>"${paper.title}"</strong> has been assigned to a reviewer and is now under review.</p>
          <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
            <h3 style="margin-top: 0; color: #374151;">Paper Details:</h3>
            <p style="margin-bottom: 5px;"><strong>Title:</strong> ${paper.title}</p>
            <p style="margin-bottom: 5px;"><strong>Conference:</strong> ${paper.conferenceId ? paper.conferenceId.name : 'Not specified'}</p>
            <p style="margin-bottom: 5px;"><strong>New Status:</strong> Under Review</p>
            <p style="margin-bottom: 0;"><strong>Updated On:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>You'll receive another notification when the review is complete.</p>
          <p>Best regards,<br />Conference Management Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
    
    try {
      // Send emails in parallel
      await Promise.all([
        transporter.sendMail(reviewerMailOptions),
        transporter.sendMail(authorMailOptions)
      ]);
      
      console.log('Review assignment emails sent successfully');
      
      return NextResponse.json({ 
        success: true, 
        message: "Email notifications sent successfully"
      }, { status: 200 });
    } catch (err) {
      console.error('Error sending email notifications:', err);
      return NextResponse.json({ 
        success: false, 
        message: "Error sending email notifications"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error in review assigned alert:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to send email notifications"
    }, { status: 500 });
  }
} 