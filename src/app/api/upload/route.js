import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadToBlob, validateFileUpload } from '@/lib/blobUtils';
import connectDB from '@/lib/connectDB';

export async function POST(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has either author or reviewer role
    if (!session || !["author", "reviewer"].includes(session.user.role)) {
      console.error(`Unauthorized upload attempt by user: ${session?.user?.email || 'unknown'}`);
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only authors and reviewers can upload files" 
      }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      console.error(`No file provided by user: ${session.user.email}`);
      return NextResponse.json({ 
        success: false, 
        message: "No file provided" 
      }, { status: 400 });
    }
    
    // Validate file upload
    const validationResult = await validateFileUpload(file);
    if (!validationResult.valid) {
      console.error(`Invalid file upload by user ${session.user.email}: ${validationResult.error}`);
      return NextResponse.json({ 
        success: false, 
        message: validationResult.error 
      }, { status: 400 });
    }
    
    // Upload file to Vercel Blob
    const { url, pathname } = await uploadToBlob(file, 'uploads');
    console.log(`File uploaded successfully by user ${session.user.email}: ${pathname}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "File uploaded successfully",
      data: {
        url,
        pathname
      }
    });
    
  } catch (error) {
    console.error("Error in POST /api/upload:", {
      error: error.message,
      stack: error.stack,
      user: session?.user?.email || 'unknown'
    });
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to upload file" 
    }, { status: 500 });
  }
} 