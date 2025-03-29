import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { Toaster } from "react-hot-toast";
import SessionWrapper from "@/components/SessionWrapper/SessionWrapper";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "CMS Platform",
  description: "A comprehensive conference management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SessionWrapper>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster position="bottom-right" />
        </SessionWrapper>
      </body>
    </html>
  );
}
