import { NextResponse } from "next/server";
import { ZodError } from "zod";
export const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
export function apiError(error:unknown){
  if(error instanceof ZodError) return NextResponse.json({error:"Invalid input",issues:error.issues},{status:400});
  console.error(error); return fail("Unexpected server error",500);
}
