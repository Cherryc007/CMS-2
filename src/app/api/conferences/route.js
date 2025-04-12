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

export async function GET(request) {
  try {
    await connectDB();
    
    // Fetch all conferences
    const allConferences = await Conference.find({}).sort({ submissionDeadline: 1 });
    
    if (!allConferences) {
      return NextResponse.json({ 
        success: false, 
        message: "No conferences found" 
      }, { status: 404 });
    }
    
    const now = new Date();
    const activeConferences = [];
    const expiredConferences = [];
    
    // Process conferences and separate into active and expired
    allConferences.forEach(conference => {
      const deadlineDate = new Date(conference.submissionDeadline);
      
      // Calculate days remaining until deadline
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysRemaining = Math.ceil((deadlineDate - now) / msPerDay);
      
      // Format conference data for frontend consumption
      const formattedConference = {
        _id: conference._id.toString(),
        name: conference.name,
        description: conference.description,
        location: conference.location,
        submissionDeadline: conference.submissionDeadline,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0
      };
      
      // Separate active and expired conferences
      if (deadlineDate >= now) {
        activeConferences.push(formattedConference);
      } else {
        expiredConferences.push(formattedConference);
      }
    });
    
    // Sort active conferences by days remaining (closest deadline first)
    activeConferences.sort((a, b) => a.daysRemaining - b.daysRemaining);
    
    // Sort expired conferences by most recently expired first
    expiredConferences.sort((a, b) => new Date(b.submissionDeadline) - new Date(a.submissionDeadline));
    
    return NextResponse.json({
      success: true,
      activeConferences,
      expiredConferences,
      total: allConferences.length,
      activeCount: activeConferences.length,
      expiredCount: expiredConferences.length
    });
    
  } catch (error) {
    console.error("Error fetching conferences:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch conferences" 
    }, { status: 500 });
  }
} 