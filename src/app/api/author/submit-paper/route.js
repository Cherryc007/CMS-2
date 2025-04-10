import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import Conference from "@/models/conferenceModel";
import User from "@/models/userModel";
import { uploadToBlob, validateFileUpload } from "@/lib/blobUtils";
import transporter from "@/lib/nodemailer";

export async function POST(request) {
  try {
    console.log('Starting paper submission process...');
    const session = await auth();
    
    // Check if user is authenticated and has author role
    if (!session || session.user.role !== "author") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only authors can submit papers" 
      }, { status: 401 });
    }
    
    const formData = await request.formData();
    const title = formData.get('title');
    const abstract = formData.get('abstract');
    const conferenceId = formData.get('conferenceId');
    const file = formData.get('file');

    console.log('Received form data:', {
      title,
      abstract,
      conferenceId,
      hasFile: !!file
    });

    // Validate required fields
    if (!title || !abstract || !conferenceId || !file) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    // Validate file upload
    const validationResult = await validateFileUpload(file);
    if (!validationResult.valid) {
      return NextResponse.json({ 
        success: false, 
        message: validationResult.error 
      }, { status: 400 });
    }

    await connectDB();
    
    // Get the author's user ID from the database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    // Check if conference exists
    const conference = await Conference.findById(conferenceId);
    if (!conference) {
      return NextResponse.json({ 
        success: false, 
        message: "Conference not found" 
      }, { status: 404 });
    }

    // Upload file to Vercel Blob
    const { url, pathname } = await uploadToBlob(file, 'papers');

    // Create new paper
    const paper = new Paper({
      title,
      abstract,
      author: user._id,
      conferenceId,
      fileUrl: url,
      filePath: pathname,
      status: "Pending",
      submittedAt: new Date()
    });

    await paper.save();

    // Send email notifications
    try {
      // Email to author
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Paper Submission Confirmation",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Paper Submission Confirmation</h2>
            <p>Hello ${user.name},</p>
            <p>Your paper has been successfully submitted:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Paper Title:</strong> ${title}</p>
              <p><strong>Conference:</strong> ${conference.name}</p>
              <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>You will be notified when reviewers are assigned to your paper.</p>
            <p>Best regards,<br>The Conference Management Team</p>
          </div>
        `
      });

      // Email to admin
      const admin = await User.findOne({ role: "admin" });
      if (admin) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: admin.email,
          subject: "New Paper Submission",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Paper Submission</h2>
              <p>A new paper has been submitted for review:</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Paper Title:</strong> ${title}</p>
                <p><strong>Author:</strong> ${user.name}</p>
                <p><strong>Conference:</strong> ${conference.name}</p>
                <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              <p>Please log in to the admin dashboard to assign reviewers.</p>
              <p>Best regards,<br>The Conference Management Team</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Paper submitted successfully",
      data: {
        paper: {
          _id: paper._id,
          title: paper.title,
          status: paper.status,
          submittedAt: paper.submittedAt
        }
      }
    });

  } catch (error) {
    console.error("Error in POST /api/author/submit-paper:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to submit paper" 
    }, { status: 500 });
  }
} 