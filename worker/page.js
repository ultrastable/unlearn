// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// The one page. Interview-first pill ask bar with a mic (INTERVIEW-1), light and dark, 16 px body, 44 px targets. No cookies, no trackers:
// the adult's curiosities are remembered only as tokens in their own browser.
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export function page({ phase = 1, ages = [] } = {}) {
  const ageLabel = { u6: "Under 6", "6-9": "6 to 9", "10-13": "10 to 13", "14+": "14 and up" };
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Coach a curious child · Unlearn</title><meta name="description" content="Most of what kids want to learn, you can't teach them. A coaching companion for the adult beside a curious child.">
<style>
:root{--bg:#fbf8f3;--fg:#1f1d1a;--muted:#5f5a52;--card:#fff;--line:#e4ddd2;--accent:#b4501e;--accent-fg:#fff;--ok:#2e6b3a}
@media (prefers-color-scheme:dark){:root{--bg:#171513;--fg:#f1ece4;--muted:#b3aa9c;--card:#211e1b;--line:#3a352f;--accent:#f08a50;--accent-fg:#1a0f08;--ok:#8fd19e}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:680px;margin:0 auto;padding:32px 16px 64px}h1{font-size:2rem;margin:0 0 4px}.lede{color:var(--muted);margin:0 0 24px}
blockquote{margin:0 0 24px;padding-left:12px;border-left:3px solid var(--accent);color:var(--muted);font-style:italic}
.pill{display:flex;gap:8px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:6px 6px 6px 18px}
.pill input{flex:1;border:0;background:transparent;color:var(--fg);font:inherit;min-height:44px;outline:none}
button{font:inherit;min-height:44px;min-width:44px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--fg);padding:0 16px;cursor:pointer}
button.primary{background:var(--accent);color:var(--accent-fg);border-color:var(--accent);font-weight:600}
button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0}.chips button[aria-pressed=true]{border-color:var(--accent);color:var(--accent);font-weight:600}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;margin:20px 0}.kind{font-size:.875rem;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);font-weight:700}
.move{font-size:1.125rem;margin:6px 0 12px}.row{display:flex;flex-wrap:wrap;gap:8px}.muted{color:var(--muted);font-size:.9375rem}
textarea{width:100%;min-height:88px;font:inherit;border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--bg);color:var(--fg)}
h2{font-size:1.25rem;margin:32px 0 8px}ul{padding-left:20px}.ok{color:var(--ok)}[hidden]{display:none!important}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style></head><body><main>
<p class="muted"><a href="/">Unlearn</a>: the evidence encyclopedia. This page is its tool for adults around curious children.</p>
<h1>Coach a curious child</h1>
<p class="lede">You don't teach curiosity. You coach it. Tell us what the child is wondering about, and get one coaching move. It's never the answer.</p>
<blockquote>"Most of what kids want to learn, you can't teach them." A coach at Agora, in Rutger Bregman's <i>Humankind</i></blockquote>
<form id="ask" autocomplete="off"><label for="q" class="muted">What is the child curious about?</label>
<div class="pill"><input id="q" name="q" maxlength="280" placeholder="Why the bread rose, how birds know where to go..." required>
<button type="button" id="mic" aria-label="Speak instead of typing" title="Speak">🎤</button><button class="primary" type="submit">Coach me</button></div>
<div class="chips" role="group" aria-label="Age">${ages.map(a => `<button type="button" data-age="${esc(a)}" aria-pressed="false">${esc(ageLabel[a] || a)}</button>`).join("")}</div>
${phase >= 2 ? `<details class="muted" style="margin-top:12px"><summary>Coaching a school group?</summary><p>Enter your group code and the nickname your school uses for the child. We never ask for a real name.</p><div class="row"><input id="grp" placeholder="Group code" maxlength="6" style="min-height:44px"><input id="nick" placeholder="Nickname" maxlength="24" style="min-height:44px"><button type="button" id="newgrp">New group code</button></div></details>` : ""}
</form>
<p id="err" class="muted" role="alert"></p>
<section id="result" class="card" hidden aria-live="polite"><div class="kind" id="kind"></div><p class="move" id="move"></p>
<div class="row"><button type="button" id="another">Another move</button></div>
<p class="muted">We'll ask you in 7 and 14 days whether they're still at it on their own. That answer is how Unlearn learns which moves work.</p>
<label for="note" class="muted">What happened? (optional coach note)</label><textarea id="note" maxlength="1000" placeholder="I asked her what she thought made it rise..."></textarea>
<div class="row" style="margin-top:8px"><button type="button" id="savenote">Save note</button><span id="tip" class="muted"></span></div></section>
<h2>Your explorations</h2><p class="muted">Kept only in this browser.</p><div id="mine"><p class="muted">None yet.</p></div>
<h2>How it learns</h2><p class="muted">Every move is a question to ask, something to try, someone to meet, or a reason to wait. Moves that keep children exploring on their own after 14 days get picked more often. No grades, streaks or child accounts. <a href="/api/metrics">Live numbers</a></p>
</main><script>
const $=s=>document.querySelector(s);let age=null,cur=null;
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let adult=store.get("unlearn.adult",null);if(!adult){adult=Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,"0")).join("");store.set("unlearn.adult",adult)}
const KIND={ask:"Ask back",try:"Something to try",connect:"Someone or somewhere",wait:"Wait and watch"};
async function api(p,b){const r=await fetch(p,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(b)});const j=await r.json().catch(()=>({message:"The connection dropped. Please try again."}));if(!r.ok||!j.ok)throw new Error(j.message||"Something went wrong.");return j}
function show(m){$("#kind").textContent=KIND[m.kind]||m.kind;$("#move").textContent=m.text;$("#result").hidden=false}
document.querySelectorAll("[data-age]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-age]").forEach(x=>x.setAttribute("aria-pressed","false"));if(age===b.dataset.age){age=null}else{age=b.dataset.age;b.setAttribute("aria-pressed","true")}});
$("#ask").onsubmit=async e=>{e.preventDefault();$("#err").textContent="";try{const g=$("#grp"),n=$("#nick");const j=await api("/api/curiosity",{text:$("#q").value,age,adult,group:g&&g.value||null,pseudonym:n&&n.value||null});cur=j.token;const t=store.get("unlearn.tokens",[]);t.unshift(j.token);store.set("unlearn.tokens",t.slice(0,50));show(j.move);$("#tip").textContent="";$("#note").value="";loadMine()}catch(x){$("#err").textContent=x.message}};
$("#another").onclick=async()=>{try{show((await api("/api/another",{token:cur})).move)}catch(x){$("#err").textContent=x.message}};
$("#savenote").onclick=async()=>{try{const j=await api("/api/note",{token:cur,text:$("#note").value});$("#tip").textContent=j.tip}catch(x){$("#tip").textContent=x.message}};
const ng=$("#newgrp");if(ng)ng.onclick=async()=>{try{const j=await api("/api/group",{name:"Group"});$("#grp").value=j.code}catch(x){$("#err").textContent=x.message}};
async function loadMine(){const t=store.get("unlearn.tokens",[]);if(!t.length)return;try{const j=await api("/api/mine",{tokens:t});const box=$("#mine");box.textContent="";for(const it of j.items){const c=document.createElement("div");c.className="card";const h=document.createElement("strong");h.textContent=it.topic;const p=document.createElement("p");p.className="muted";p.textContent=it.created+": "+it.move;c.append(h,p);for(const d of it.due){const q=document.createElement("p");q.textContent="Day "+d+": are they still exploring this on their own?";const r=document.createElement("div");r.className="row";for(const [lab,v,led] of (d===14?[["Yes, mostly on their own",true,"child"],["Yes, together",true,"together"],["Yes, mostly me",true,"adult"],["No",false,null]]:[["Yes",true,null],["No",false,null]])){const b=document.createElement("button");b.textContent=lab;b.onclick=async()=>{await api("/api/followup",{token:it.token,day:d,still:v,led}).catch(x=>{$("#err").textContent=x.message});loadMine()};r.append(b)}c.append(q,r)}if(it.f14!==null){const s=document.createElement("p");s.className="ok";s.textContent=it.f14?"Still going at 14 days.":"Moved on by 14 days. That's fine too.";c.append(s)}box.append(c)}}catch(x){$("#mine").textContent=x.message}}
loadMine();
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$("#mic").hidden=true}else{$("#mic").onclick=()=>{const r=new SR();r.lang=navigator.language||"en";r.onresult=e=>{$("#q").value=e.results[0][0].transcript};r.onerror=e=>{$("#err").textContent=e.error==="not-allowed"?"The microphone is blocked. You can type instead.":"We didn't catch that. Try again or type."};r.start()}}
</script></body></html>`;
}
