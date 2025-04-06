import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./lib/connectDB";
import User from "./models/userModel";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    //trustHost: true,
    strategy: "jwt", // ✅ Ensures token-based sessions (fully supported on Vercel)
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true, 
        //domain: ".cms-lpu.vercel.app", // <-- YOUR REAL DOMAIN
      },
    },
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      id: "credentials",
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          // Add logic here to look up the user from the credentials supplied
          await connectDB();

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const user = await User.findOne({
            email: credentials.email,
          });

          if (!user) {
            throw new Error("User not found");
          }

          // Check if the user has a password (they might have signed up with OAuth)
          if (!user.password) {
            throw new Error(
              "Please sign in with the provider you used to register"
            );
          }

          const isMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isMatch) {
            throw new Error("Invalid email or password");
          }

          // Return user object with required fields for next-auth
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "author",
          };
        } catch (error) {
          console.error("Authorize error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, req }) {
      if (
        account &&
        (account.provider === "google" || account.provider === "github")
      ) {
        await connectDB();
        try {
          const existingUser = await User.findOne({
            email: user.email,
          });

          if (!existingUser) {
            // Create a new user in the database
            const response = await fetch(
              `${process.env.NEXTAUTH_URL}/api/signUp`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: user.name,
                  email: user.email,
                  password: "defaultPassword",
                  role: "author",
                  isVerified: true,
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to create user: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
              throw new Error(`API error: ${data.message}`);
            }

            // Set the role in the user object
            user.role = "author";
            
            // Send new user notification
            try {
              const notifications = await fetch(`${process.env.NEXTAUTH_URL}/api/sendMail/newUserAlert`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                  userEmail: user.email,
                  userName: user.name,
                  userRole: "author"
                }),
              });
              
              const notificationResponse = await notifications.json();
              if (!notificationResponse.success) {
                console.error("Failed to send welcome email:", notificationResponse.message);
              } else {
                console.log("Welcome email sent for new user:", user.email);
              }
            } catch (emailError) {
              console.error("Failed to send new user notification:", emailError);
            }
          } else {
            // If user exists, get their role from the database
            user.role = existingUser.role;
          }

          // Ensure the role is set before returning
          if (!user.role) {
            user.role = "author"; // Fallback to author if no role is set
          }

          return true;
        } catch (error) {
          console.error("Sign in error:", error);
          return false;
        }
      }
      
      // Send login notification for all successful logins
      try {
        // Get client information from headers if available
        const userAgent = req?.headers?.['user-agent'] || 'Unknown device';
        const ipAddress = req?.headers?.['x-forwarded-for'] || 
                         req?.headers?.['x-real-ip'] || 
                         'Unknown IP';
                         
        const loginNotification = await fetch(`${process.env.NEXTAUTH_URL}/api/sendMail/loginAlert`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: user.email,
            userName: user.name,
            userRole: user.role || "author",
            timestamp: new Date().toISOString(),
            ipAddress,
            userAgent
          }),
        });
        
        const loginResponse = await loginNotification.json();
        if (!loginResponse.success) {
          console.error("Failed to send login notification:", loginResponse.message);
        } else {
          console.log("Login notification sent for user:", user.email);
        }
      } catch (emailError) {
        console.error("Failed to send login notification:", emailError);
        // Don't block login if email notification fails
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});