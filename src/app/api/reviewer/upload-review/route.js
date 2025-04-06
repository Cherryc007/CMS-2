import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - You must be logged in to upload files" 
      }, { status: 401 });
    }

    // Check role
    if (session.user.role !== "reviewer") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only reviewers can upload review files" 
      }, { status: 403 });
    }

    // Handle file upload
    const formData = await request.formData();
    const file = formData.get('file');
    const paperId = formData.get('paperId');

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: "No file uploaded" 
      }, { status: 400 });
    }

    if (!paperId) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper ID is required" 
      }, { status: 400 });
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json({ 
        success: false, 
        message: "Only PDF files are allowed" 
      }, { status: 400 });
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `review-${paperId}-${uniqueSuffix}.pdf`;
    const uploadDir = 'public/uploads/reviews';
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Return the file path relative to public directory
    const relativePath = `/uploads/reviews/${filename}`;

    return NextResponse.json({ 
      success: true, 
      message: "Review file uploaded successfully",
      filePath: relativePath
    }, { status: 200 });

  } catch (error) {
    console.error("Error uploading review file:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to upload review file" 
    }, { status: 500 });
  }
} 