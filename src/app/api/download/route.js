import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { get } from "@vercel/blob";

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({ 
        success: false, 
        message: "File path is required" 
      }, { status: 400 });
    }

    try {
      // Get the blob URL from Vercel Blob
      const blob = await get(filePath);
      
      if (!blob || !blob.url) {
        throw new Error("File not found in storage");
      }

      // Redirect to the blob URL for download
      return NextResponse.json({ 
        success: true, 
        url: blob.url 
      });

    } catch (fileError) {
      console.error("File access error:", fileError);
      return NextResponse.json({ 
        success: false, 
        message: "File not found" 
      }, { status: 404 });
    }

  } catch (error) {
    console.error("Error in POST /api/download:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to download file" 
    }, { status: 500 });
  }
} 