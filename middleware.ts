import {NextRequest,NextResponse} from "next/server";
export function middleware(req:NextRequest){return req.cookies.get("aw_session")?NextResponse.next():NextResponse.redirect(new URL("/login",req.url))}
export const config={matcher:["/menu/:path*","/language/:path*","/game/:path*"]};
