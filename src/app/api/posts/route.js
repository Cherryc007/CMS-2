import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Post from "@/models/postModel";

export async function GET(request) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 10;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1;
    const featured = searchParams.get('featured') === 'true';
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (featured) query.featured = true;
    
    // Fetch posts with pagination
    const skip = (page - 1) * limit;
    const posts = await Post.find(query)
      .populate('author', 'name email')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);
    
    // Format posts for frontend consumption
    const formattedPosts = posts.map(post => ({
      id: post._id.toString(),
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
      author: post.author ? post.author.name : "Unknown",
      publishedAt: post.publishedAt.toISOString(),
      category: post.category,
      featured: post.featured,
      tags: post.tags || []
    }));
    
    return NextResponse.json({ 
      success: true, 
      posts: formattedPosts,
      pagination: {
        total: totalPosts,
        page,
        limit,
        pages: Math.ceil(totalPosts / limit)
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch posts" 
    }, { status: 500 });
  }
} 