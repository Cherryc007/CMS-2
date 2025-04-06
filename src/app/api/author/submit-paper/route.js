import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import Conference from "@/models/conferenceModel";
import User from "@/models/userModel";
import { auth } from "@/auth";
import { uploadToBlob, validateFileUpload } from "@/lib/blobUtils";

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
        message: "User not found in the database" 
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
    
    console.log('Uploading file to Vercel Blob...');
    // Upload file to Vercel Blob
    const { url, pathname } = await uploadToBlob(file, 'papers');
    console.log('File uploaded successfully:', { url, pathname });
    
    // Create new paper
    const paper = await Paper.create({
      title,
      abstract,
      conferenceId,
      author: user._id, // Use the MongoDB _id from the user document
      fileUrl: url,
      filePath: pathname,
      status: "Pending"
    });
    
    console.log('Paper created successfully:', paper._id);
    
    // Send email notifications
    try {
      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/sendMail/paperSubmissionAlert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          paperId: paper._id.toString(),
          conferenceId: conference._id.toString()
        }),
      });
      
      if (!emailResponse.ok) {
        console.error("Failed to send email notifications, but paper was submitted successfully");
      }
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Paper submitted successfully",
      paper: {
        id: paper._id.toString(),
        title: paper.title,
        abstract: paper.abstract,
        fileUrl: paper.fileUrl,
        filePath: paper.filePath,
        status: paper.status
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error submitting paper:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to submit paper" 
    }, { status: 500 });
  }
} 