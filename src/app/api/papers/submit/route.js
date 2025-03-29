import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Paper from '@/models/paperModel';
import User from '@/models/userModel';

export async function POST(request) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized: Please log in to submit a paper' },
        { status: 401 }
      );
    }

    // Get JSON data from the request
    const paperData = await request.json();
    
    if (!paperData) {
      return NextResponse.json(
        { message: 'Missing paper data' },
        { status: 400 }
      );
    }
    
    // Validate that the email in the session matches the submission email
    if (session.user.email !== paperData.userEmail) {
      return NextResponse.json(
        { message: 'Unauthorized: Email mismatch' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!paperData.conferenceId || !paperData.title || !paperData.abstract || !paperData.fileUrl) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate the URL format
    try {
      new URL(paperData.fileUrl);
    } catch (err) {
      return NextResponse.json(
        { message: 'Invalid document URL format' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();
    
    // Find the user by email
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Create a new paper document
    const newPaper = new Paper({
      title: paperData.title,
      abstract: paperData.abstract,
      fileUrl: paperData.fileUrl,
      author: user._id,
    //   conferenceId: paperData.conferenceId,
    });

    // Save the paper to the database
    await newPaper.save();

    // Return the created paper data
    return NextResponse.json({
      message: 'Paper submitted successfully',
      paper: {
        title: newPaper.title,
        abstract: newPaper.abstract,
        status: newPaper.status,
        createdAt: newPaper.createdAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error submitting paper:', error);
    return NextResponse.json(
      { message: 'An error occurred while submitting your paper' },
      { status: 500 }
    );
  }
} 