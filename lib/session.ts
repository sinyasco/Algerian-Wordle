import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const COOKIE = "aw_session";
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? "");
export async function setSession(userId:string){
  if(key().length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  const token=await new SignJWT({sub:userId}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(key());
  (await cookies()).set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:604800});
}
export async function clearSession(){ (await cookies()).set(COOKIE,"",{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:0}); }
export async function getUserId(){
  const token=(await cookies()).get(COOKIE)?.value; if(!token) return null;
  try { const {payload}=await jwtVerify(token,key()); return typeof payload.sub==="string"?payload.sub:null; } catch { return null; }
}
