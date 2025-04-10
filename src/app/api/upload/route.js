import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { uploadToBlob, validateFileUpload } from '@/lib/blobUtils';
import { connectDB } from '@/lib/connectDB';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has either author or reviewer role
    if (!session || !["author", "reviewer"].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only authors and reviewers can upload files" 
      }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: "No file provided" 
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
    
    // Upload file to Vercel Blob
    const { url, pathname } = await uploadToBlob(file, 'uploads');
    
    return NextResponse.json({ 
      success: true, 
      message: "File uploaded successfully",
      data: {
        url,
        pathname
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to upload file" 
    }, { status: 500 });
  }
} 