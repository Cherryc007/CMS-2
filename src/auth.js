import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "./lib/connectDB";
import User from "./models/userModel";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    trustHost: true,
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
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.password) {
          throw new Error("Please sign in with the provider you used to register");
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "author",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google" || account.provider === "github") {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/signUp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              password: "defaultPassword",
              role: "author",
              isVerified: true,
            }),
          });

          if (!response.ok) throw new Error(`Failed to create user: ${response.status}`);

          user.role = "author";
        } else {
          user.role = existingUser.role;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role; // ✅ Ensure role is stored in token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role; // ✅ Ensure role is included in session
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
