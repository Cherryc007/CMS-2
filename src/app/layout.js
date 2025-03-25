import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

import SessionWrapper from "@/components/SessionWrapper/SessionWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Conference Management System",
  description: "A system for managing conference papers and reviews",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <SessionWrapper>
        <body className={`${inter.variable} antialiased`}>
          <Navbar />
          {children}
          <Footer />
        </body>
      </SessionWrapper>
    </html>
  );
}
