import { NextResponse } from "next/server";
import {getToken} from "next-auth/jwt"

export default async function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Get the token using next-auth
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  // Check if the user is authenticated
  const isAuthenticated = !!token;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || path === '/login' || path === '/register';
  
  // Define paths that authenticated users can access without role checks
  const isCommonAuthPath = path === '/home';
  
  // Redirect to login if not authenticated and trying to access protected pages
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect to home if already authenticated but trying to access login/register
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  // Allow access to common authenticated paths without role checks
  if (isAuthenticated && isCommonAuthPath) {
    return NextResponse.next();
  }
  
  // Role-based access control
  if (isAuthenticated) {
    // Admin-only routes
    if (path.startsWith('/admin-dashboard') || 
        path === '/conference-creation' || 
        path === '/admin-dashboard/create-post') {
      if (token.role !== 'admin') {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
    
    // Author-only routes
    if (path.startsWith('/author-dashboard')) {
      if (token.role !== 'author') {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
    
    // Reviewer-only routes
    if (path.startsWith('/reviewer-dashboard') || path.startsWith('/review-paper')) {
      if (token.role !== 'reviewer') {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/admin-dashboard/:path*',
    '/author-dashboard/:path*',
    '/reviewer-dashboard/:path*',
    '/review-paper/:path*',
    '/conference-creation',
    '/admin-dashboard/create-post',
    '/home'
  ],
};