import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadToBlob, validateFileUpload } from '@/lib/blobUtils';

export async function POST(request) {
  try {
    console.log('Starting file upload process...');
    const session = await auth();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - You must be logged in to upload files" 
      }, { status: 401 });
    }

    // Check role
    if (session.user.role !== "author") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only authors can upload files" 
      }, { status: 403 });
    }

    // Handle file upload
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: "No file uploaded" 
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

    console.log('Uploading file to Vercel Blob...');
    // Upload file to Vercel Blob
    const { url, pathname } = await uploadToBlob(file, 'papers');
    console.log('File uploaded successfully:', { url, pathname });

    return NextResponse.json({ 
      success: true, 
      message: "File uploaded successfully",
      fileUrl: url,
      filePath: pathname
    }, { status: 200 });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to upload file" 
    }, { status: 500 });
  }
} 