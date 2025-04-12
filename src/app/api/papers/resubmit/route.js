import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import { auth } from "@/auth";
import { validateFileUpload } from "@/lib/fileValidation";
import { uploadToBlob } from "@/lib/blobUtils";

/**
 * POST endpoint to handle paper resubmission
 * @param {Object} request - The request object containing paper details and file
 * @returns {Object} Updated paper details
 */
export async function POST(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has author role
    if (!session || session.user.role !== "author") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only authors can resubmit papers" 
      }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const paperId = formData.get("paperId");
    const file = formData.get("file");
    const feedback = formData.get("feedback");

    if (!paperId || !file) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper ID and file are required" 
      }, { status: 400 });
    }

    await connectDB();

    // Find the paper and verify ownership
    const paper = await Paper.findOne({
      _id: paperId,
      author: session.user.id,
      status: "RequestResubmit"
    });

    if (!paper) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper not found or not eligible for resubmission" 
      }, { status: 404 });
    }

    // Validate file upload
    const validationError = validateFileUpload(file);
    if (validationError) {
      return NextResponse.json({ 
        success: false, 
        message: validationError 
      }, { status: 400 });
    }

    // Upload file to Vercel Blob
    console.log("Uploading resubmitted file to Vercel Blob...");
    const { url: fileUrl, path: filePath } = await uploadToBlob(file);
    console.log("File uploaded successfully:", fileUrl);

    // Add current version to resubmission history
    const resubmissionEntry = {
      version: paper.currentVersion,
      fileUrl: paper.fileUrl,
      filePath: paper.filePath,
      submittedAt: new Date(),
      feedback: feedback || "No feedback provided"
    };

    // Update paper with new file and increment version
    const updatedPaper = await Paper.findByIdAndUpdate(
      paperId,
      {
        $push: { resubmissionHistory: resubmissionEntry },
        $inc: { currentVersion: 1 },
        fileUrl,
        filePath,
        status: "Resubmitted"
      },
      { new: true }
    )
    .populate('author', 'name email')
    .populate('conference', 'name')
    .populate('reviewers', 'name email')
    .lean();

    console.log("Paper resubmitted successfully:", updatedPaper._id);

    return NextResponse.json({ 
      success: true, 
      message: "Paper resubmitted successfully",
      paper: {
        id: updatedPaper._id.toString(),
        title: updatedPaper.title,
        status: updatedPaper.status,
        version: updatedPaper.currentVersion,
        conference: updatedPaper.conference?.name
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in paper resubmission:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to resubmit paper" 
    }, { status: 500 });
  }
} 