import { NextResponse } from "next/server";
import transporter from "@/lib/nodemailer";

export async function POST(request) {
  try {
    // We don't require a session for this endpoint as it's called during login
    const { userEmail, userName, userRole, timestamp, ipAddress, userAgent } = await request.json();
    
    if (!userEmail || !userRole) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }
    
    // Format timestamp if provided, otherwise use current time
    const loginTime = timestamp ? new Date(timestamp) : new Date();
    const formattedLoginTime = loginTime.toLocaleString();
    
    // Email to user
    const mailOptions = {
      from: process.env.GMAIL_ID,
      to: userEmail,
      subject: "New Login Alert - Conference Management System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">New Login Alert</h2>
          <p>Dear ${userName || userEmail},</p>
          <p>We noticed a new login to your Conference Management System account.</p>
          <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 3px;">
            <h3 style="margin-top: 0; color: #374151;">Login Details:</h3>
            <p style="margin-bottom: 5px;"><strong>Time:</strong> ${formattedLoginTime}</p>
            ${ipAddress ? `<p style="margin-bottom: 5px;"><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
            ${userAgent ? `<p style="margin-bottom: 5px;"><strong>Device/Browser:</strong> ${userAgent}</p>` : ''}
            <p style="margin-bottom: 0;"><strong>Account Type:</strong> ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
          </div>
          <p>If this was you, no action is needed. If you don't recognize this login, please contact the system administrator immediately to secure your account.</p>
          <p>Best regards,<br />Conference Management Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Login alert email sent successfully to:', userEmail);
      
      return NextResponse.json({ 
        success: true, 
        message: "Login alert email sent successfully"
      }, { status: 200 });
    } catch (err) {
      console.error('Error sending login alert email:', err);
      return NextResponse.json({ 
        success: false, 
        message: "Error sending login alert email"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error in login alert:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to send login alert email"
    }, { status: 500 });
  }
}
