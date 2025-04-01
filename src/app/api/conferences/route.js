import connectDB from "@/lib/connectDB";
import Conference from "@/models/conferenceModel";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request) {
  await connectDB();
  
  try {
    const body = await request.json();
    const { name, submissionDeadline, location, description } = body;
    
    if (!name || !submissionDeadline || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const conference = await Conference.create({
      name,
      submissionDeadline,
      location,
      description
    });
    
    return NextResponse.json({ 
      message: "Conference created successfully", 
      conference 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating conference:", error);
    return NextResponse.json(
      { error: "Failed to create conference" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - You must be logged in to view conferences" 
      }, { status: 401 });
    }
    
    await connectDB();
    
    // Fetch active conferences that are open for submissions
    const conferences = await Conference.find({ 
      submissionDeadline: { $gt: new Date() } // Only conferences with future submission deadlines
    })
    .select('name description submissionDeadline _id location')
    .sort({ submissionDeadline: 1 }) // Sort by closest deadline first
    .lean();
    
    // Format conferences for frontend consumption
    const formattedConferences = conferences.map(conference => ({
      id: conference._id.toString(),
      name: conference.name,
      description: conference.description || "",
      location: conference.location,
      submissionDeadline: new Date(conference.submissionDeadline).toLocaleDateString()
    }));
    
    return NextResponse.json({ 
      success: true, 
      conferences: formattedConferences
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching conferences:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch conferences" 
    }, { status: 500 });
  }
} 