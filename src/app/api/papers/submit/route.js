import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Paper from '@/models/paperModel';
import User from '@/models/userModel';
import Conference from '@/models/conferenceModel';

export async function POST(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - You must be logged in to submit a paper" 
      }, { status: 401 });
    }
    
    // Check role
    if (session.user.role !== "author") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only authors can submit papers" 
      }, { status: 403 });
    }
    
    // Get request body
    const body = await request.json();
    const { title, abstract, filePath, fileUrl, conferenceId } = body;
    
    // Validate required fields
    if (!title || !abstract || !filePath || !fileUrl || !conferenceId) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Get the author's user ID from the database
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found in the database" 
      }, { status: 404 });
    }
    
    console.log(`Processing submission for user: ${user._id}, conference: ${conferenceId}`);
    
    // Verify the conference exists and is accepting submissions
    const conference = await Conference.findById(conferenceId);
    
    if (!conference) {
      return NextResponse.json({ 
        success: false, 
        message: "Conference not found" 
      }, { status: 404 });
    }
    
    const now = new Date();
    if (conference.submissionDeadline < now) {
      return NextResponse.json({ 
        success: false, 
        message: "The submission deadline for this conference has passed" 
      }, { status: 400 });
    }
    
    // Create new paper
    const paper = await Paper.create({
      title,
      abstract,
      conferenceId,
      author: user._id,
      filePath,
      fileUrl,
      status: "Pending"
    });
    
    await paper.save();
    
    console.log(`Paper submitted successfully: ${paper._id}`);
    
    // Send email notifications
    try {
      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/sendMail/paperSubmissionAlert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '' // Forward cookies for auth
        },
        body: JSON.stringify({
          paperTitle: title,
          authorId: user._id.toString(),
          authorEmail: user.email,
          authorName: user.name,
          conferenceId: conference._id.toString()
        }),
      });
      
      if (!emailResponse.ok) {
        console.error("Failed to send email notifications, but paper was submitted successfully");
      } else {
        console.log("Email notifications sent successfully");
      }
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Paper submitted successfully",
      paperId: paper._id.toString()
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error submitting paper:", error);
    
    // More specific error messages based on error type
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        success: false, 
        message: "Validation error: " + Object.values(error.errors).map(e => e.message).join(', ') 
      }, { status: 400 });
    } else if (error.name === 'CastError') {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid ID format" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to submit paper" 
    }, { status: 500 });
  }
} 