import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Post from "@/models/postModel";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - Only administrators can create posts" 
      }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, description, imageUrl, category, tags, featured } = body;
    
    // Validate required fields
    if (!title || !description || !imageUrl) {
      return NextResponse.json({ 
        success: false, 
        message: "Title, description, and image URL are required" 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Create new post
    const post = await Post.create({
      title,
      description,
      imageUrl,
      author: session.user.id,
      category: category || "Announcement",
      tags: tags || [],
      featured: featured || false,
      publishedAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Post created successfully",
      postId: post._id.toString()
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to create post" 
    }, { status: 500 });
  }
} 