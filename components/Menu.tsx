"use client";import{useEffect,useState}from"react";import{useRouter}from"next/navigation";import{AppShell,Brand,useI18n}from"./AppShell";
export default function Menu(){return <AppShell><Inner/></AppShell>}function Inner(){const{t}=useI18n(),r=useRouter(),[u,setU]=useState({username:"…",score:0});useEffect(()=>{fetch("/api/auth/me").then(x=>x.json()).then(x=>x.user&&setU(x.user))},[]);const item=(icon:string,title:string,desc:string,onClick:()=>void,primary=false)=><button className={`menu-item ${primary?"featured":""}`} onClick={onClick}><span className="menu-icon">{icon}</span><span><b>{title}</b><small>{desc}</small></span><em>›</em></button>;return <main className="center"><Brand compact/><p className="welcome">@{u.username}</p><div className="score-pill">🏆 {t.score}: <b>{u.score}</b></div><div className="menu-list">
  {item(
    "🎮",
    t.play,
    t.playDesc,
    () => r.push("/language"),
    true
  )}

  {item(
    "↪",
    t.logout,
    t.logoutDesc,
    async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      r.push("/login");
      r.refresh();
    }
  )}
</div></main>}
