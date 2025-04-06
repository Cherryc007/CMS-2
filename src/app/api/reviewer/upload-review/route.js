import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadToBlob, validateFileUpload } from '@/lib/blobUtils';

export async function POST(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has reviewer role
    if (!session || session.user.role !== "reviewer") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only reviewers can upload review files" 
      }, { status: 401 });
    }

    // Handle file upload
    const formData = await request.formData();
    const file = formData.get('file');
    const paperId = formData.get('paperId');

    // Validate required fields
    if (!file || !paperId) {
      return NextResponse.json({ 
        success: false, 
        message: "File and paper ID are required" 
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
    const { url, pathname } = await uploadToBlob(file, `review-${paperId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Review file uploaded successfully",
      fileUrl: url,
      filePath: pathname
    }, { status: 200 });

  } catch (error) {
    console.error("Error uploading review file:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to upload review file" 
    }, { status: 500 });
  }
} 