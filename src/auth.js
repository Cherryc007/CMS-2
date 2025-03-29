import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./lib/connectDB";
import User from "./models/userModel";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHub({
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
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
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
            throw new Error("Please sign in with the provider you used to register");
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
    async signIn({ user, account }) {
      if (account && (account.provider === "google" || account.provider === "github")) {
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
