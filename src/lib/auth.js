import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import User from "@/models/userModel";
import connectDB from "@/lib/connectDB"
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID || 'null',
      clientSecret: process.env.GITHUB_SECRET || 'null',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'null',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'null',
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
        email: { label: "email", type: "text", placeholder: "na" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const user = await User.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (user) {
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // async signIn({ user, account }) {
    //   if (account.provider === "google" || account.provider === "github") {
    //     // console.log("user is ", user,"account is ",account)
    //     try {
    //       const existingUser = await prisma.User.findUnique({
    //         where: { email: user.email },
    //       });

    //       if (!existingUser) {
    //         console.log("Creating New User...");
    //         const username = user.email.split("@")[0];
    //         await prisma.User.create({
    //           data: {
    //             email: user.email,
    //             name: user.name || "NULL",
    //             username: username,
    //             profileImage : user.image || "https://st4.depositphotos.com/3557671/23892/v/450/depositphotos_238923408-stock-illustration-vector-illustration-of-avatar-and.jpg",
    //           },
    //         });
    //       }
    //     } catch (e) {
    //       console.error("Error while connecting to the database:", e);
    //       return false; // Block sign-in on error
    //     }
    //   }

    //   const existingUser = await prisma.User.findUnique({
    //     where: {
    //       email: user.email,
    //     },
    //   });
    //   const userName = existingUser.name || "Not Available";

    //   await fetch(`${process.env.NEXTAUTH_URL}/api/sendMail`, {
    //     method: "POST",
    //     headers: { "content-Type": "application/json" },
    //     body: JSON.stringify({ email: user.email, name: userName }),
    //   });
    //   return true; // Allow sign-in for other providers
    // },
    async redirect({ url, baseUrl, user }) {
      return `${baseUrl}/`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name      }
      return token;
    },
    async session({ session, token }) {
      session.user.email = token.email;
      session.user.name = token.name;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
