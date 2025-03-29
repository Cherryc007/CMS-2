import { NextResponse } from "next/server";
export default function middleware(req,res){
    NextResponse.next()
}
export const config =  {
    matcher : ["/admin-dashboard/:path*","/author-dashboard/:path*"]
}