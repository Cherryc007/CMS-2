import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { user, provider } = await request.json();

    if (!user?.email) {
      return NextResponse.json(
        { message: "Invalid user data" },
        { status: 400 }
      );
    }

    await connectDB();
    const existingUser = await User.findOne({ email: user.email });

    if (!existingUser) {
      const newUser = await User.create({
        name: user.name,
        email: user.email,
        role: "author", // Default role for social login
        password: await bcrypt.hash(Math.random().toString(36), 10)
      });

      return NextResponse.json({
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      });
    }

    return NextResponse.json({
      user: {
        id: existingUser._id.toString(),
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role
      }
    });
  } catch (error) {
    console.error("Social login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 