import { NextResponse } from "next/server";
import transporter from "@/lib/nodemailer";
import connectDB from "@/lib/connectDB";
import User from "@/models/userModel";

export async function POST(request) {
  try {
    // We don't require a session for this endpoint as it's called during user registration
    const { userId, userEmail, userName, userRole } = await request.json();
    
    if (!userEmail || !userRole) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Get admins to notify about new user
    const admins = await User.find({ role: "admin" }).select("email name");
    
    if (!admins || admins.length === 0) {
      console.warn("No admin users found to notify about new user");
    }
    
    const getRoleSpecificContent = (role) => {
      switch (role.toLowerCase()) {
        case 'author':
          return `
            <p>As an author, you can:</p>
            <ul style="margin-bottom: 15px;">
              <li>Submit papers to available conferences</li>
              <li>Track the status of your submissions</li>
              <li>Receive feedback from reviewers</li>
              <li>Submit final versions of accepted papers</li>
            </ul>
          `;
        case 'reviewer':
          return `
            <p>As a reviewer, you can:</p>
            <ul style="margin-bottom: 15px;">
              <li>Receive paper assignments from conference administrators</li>
              <li>Review assigned papers</li>
              <li>Provide feedback and ratings</li>
              <li>Help shape the quality of academic conferences</li>
            </ul>
          `;
        case 'admin':
          return `
            <p>As an administrator, you can:</p>
            <ul style="margin-bottom: 15px;">
              <li>Manage conferences and submissions</li>
              <li>Assign reviewers to papers</li>
              <li>Monitor review progress</li>
              <li>Make final decisions on paper acceptance</li>
              <li>Manage users and their roles</li>
            </ul>
          `;
        default:
          return '';
      }
    };
    
    // Email to new user
    const userMailOptions = {
      from: process.env.GMAIL_ID,
      to: userEmail,
      subject: "Welcome to the Conference Management System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Welcome to the Conference Management System</h2>
          <p>Dear ${userName || userEmail},</p>
          <p>Thank you for joining our Conference Management System. Your account has been successfully created with the role of <strong>${userRole.charAt(0).toUpperCase() + userRole.slice(1)}</strong>.</p>
          
          ${getRoleSpecificContent(userRole)}
          
          <p>To get started, log in to your account and explore the dashboard tailored to your role.</p>
          <p>Best regards,<br />Conference Management Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
    
    // Email to admins about new user
    if (admins.length > 0) {
      const adminEmails = admins.map(admin => admin.email);
      
      const adminMailOptions = {
        from: process.env.GMAIL_ID,
        to: adminEmails.join(", "),
        subject: "New User Registration Alert",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">New User Registration</h2>
            <p>A new user has registered on the Conference Management System.</p>
            <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
              <h3 style="margin-top: 0; color: #374151;">User Details:</h3>
              <p style="margin-bottom: 5px;"><strong>Name:</strong> ${userName || 'Not provided'}</p>
              <p style="margin-bottom: 5px;"><strong>Email:</strong> ${userEmail}</p>
              <p style="margin-bottom: 5px;"><strong>Role:</strong> ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
              <p style="margin-bottom: 0;"><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>You can manage this user from the admin dashboard.</p>
            <p>Conference Management System</p>
          </div>
        `
      };
      
      try {
        await transporter.sendMail(adminMailOptions);
        console.log('Admin notification email sent successfully for new user:', userEmail);
      } catch (err) {
        console.error('Error sending admin notification email:', err);
      }
    }
    
    try {
      await transporter.sendMail(userMailOptions);
      console.log('Welcome email sent successfully to:', userEmail);
      
      return NextResponse.json({ 
        success: true, 
        message: "Welcome email sent successfully"
      }, { status: 200 });
    } catch (err) {
      console.error('Error sending welcome email:', err);
      return NextResponse.json({ 
        success: false, 
        message: "Error sending welcome email"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error in new user alert:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to send welcome email"
    }, { status: 500 });
  }
}
