import {Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {getUserId} from "@/lib/session";
import {gameGuessSchema} from "@/lib/validation";
import {evaluate,validGuess} from "@/lib/game";
import {apiError,fail} from "@/lib/api";
import {NextResponse} from "next/server";

export async function POST(req:Request){
  try{
    const uid=await getUserId(); if(!uid)return fail("Unauthorized",401);
    const {sessionId,guess:raw}=gameGuessSchema.parse(await req.json());
    const response=await prisma.$transaction(async tx=>{
      const s=await tx.gameSession.findFirst({where:{id:sessionId,userId:uid},include:{word:true}});
      if(!s)throw new GameError("Game not found",404);
      if(s.status!=="in_progress")throw new GameError("Game has ended",409);
      if(s.lastGuessAt&&Date.now()-s.lastGuessAt.getTime()<700)throw new GameError("Please wait before guessing again",429);
      const guess=s.word.language==="arabizi"?raw.toUpperCase():raw;
      if(Array.from(guess).length!==s.word.length||!validGuess(guess,s.word.language))throw new GameError("Invalid guess",400);
      const old=Array.isArray(s.attempts)?s.attempts:[]; if(old.length>=6)throw new GameError("No attempts remaining",409);
      const result=evaluate(guess,s.word.text),attempts=[...old,{guess,result}],won=guess===s.word.text,lost=!won&&attempts.length===6;
      const status=won?"won":lost?"lost":"in_progress";
      await tx.gameSession.update({where:{id:s.id},data:{attempts:attempts as Prisma.InputJsonValue,status,lastGuessAt:new Date(),finishedAt:status==="in_progress"?null:new Date()}});
      const user=won?await tx.user.update({where:{id:uid},data:{score:{increment:5}},select:{score:true}}):await tx.user.findUniqueOrThrow({where:{id:uid},select:{score:true}});
      return {result,attemptNumber:attempts.length,status,...(status!=="in_progress"?{word:s.word.text,totalScore:user.score,points:won?5:0}:{})};
    },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
    return NextResponse.json(response);
  }catch(e){if(e instanceof GameError)return fail(e.message,e.status);return apiError(e)}
}
class GameError extends Error{constructor(message:string,public status:number){super(message)}}
