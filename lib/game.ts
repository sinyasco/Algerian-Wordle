export type Mark="correct"|"present"|"absent";
export function evaluate(guess:string,target:string):Mark[]{
  const g=Array.from(guess), t=Array.from(target), out:Mark[]=g.map(()=>"absent"), used=t.map(()=>false);
  g.forEach((c,i)=>{if(c===t[i]){out[i]="correct";used[i]=true;}});
  g.forEach((c,i)=>{if(out[i]!=="correct"){const j=t.findIndex((x,k)=>!used[k]&&x===c);if(j>=0){out[i]="present";used[j]=true;}}});
  return out;
}
export const validGuess=(guess:string,lang:"arabic"|"arabizi") => lang==="arabic" ? /^[\u0621-\u064A]+$/u.test(guess) : /^[A-Za-z0-9]+$/.test(guess);
