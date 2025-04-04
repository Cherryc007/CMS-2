import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/models/userModel';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // Connect to database
    await connectDB();
    
    // Parse the request body
    const data = await request.json();
    const { name, email, password, role } = data;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    
    // Send welcome email
    try {
      const welcomeResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sendMail/newUserAlert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: newUser._id.toString(),
          userEmail: newUser.email,
          userName: newUser.name,
          userRole: newUser.role
        }),
      });
      
      if (!welcomeResponse.ok) {
        console.error("Failed to send welcome email but user was created successfully");
      } else {
        console.log("Welcome email sent to new user:", email);
      }
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't block registration if email fails
    }
    
    // Return success response (without password)
    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
