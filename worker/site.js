// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// The encyclopedia's pages, rendered on the server from entries.js so every page works with no script, is indexable, and comes from the
// same data as /api/entries.json. Script only adds the point-and-click parts: guess buttons, filters, play mode. Light and dark, 16 px
// body, 44 px targets, visible focus, reduced motion respected. No cookies, no trackers.
import { ENTRIES, CATEGORIES, STRENGTH, DIRECTION, DESIGN, METHOD, FORMAT } from "./entries.js";
import { EVIDENCE } from "./evidence.js";
import { LAB } from "./lab.js";

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const catOf = id => CATEGORIES.find(c => c.id === id);
export const byId = Object.fromEntries(ENTRIES.map(e => [e.id, e]));

export function sourceLinks(src, doi) {
  const q = encodeURIComponent((src.title + " " + src.authors).slice(0, 200));
  return { doi: doi ? "https://doi.org/" + doi : null, scholar: "https://scholar.google.com/scholar?q=" + q, epmc: "https://europepmc.org/search?query=" + encodeURIComponent(src.title.slice(0, 200)) };
}

// Keyword search over beliefs, explanations and sources: every word must appear; belief words weigh more.
export function search(q) {
  const ws = String(q || "").toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 1);
  if (!ws.length) return [];
  return ENTRIES.map(e => {
    const t = e.belief.toLowerCase(), b = [e.says, e.feels, e.slip, e.instead, catOf(e.cat).name, e.sources.map(s => s.title + " " + s.authors + " " + s.finding).join(" ")].join(" ").toLowerCase();
    if (!ws.every(w => t.includes(w) || b.includes(w))) return null;
    return { e, score: ws.reduce((n, w) => n + (t.includes(w) ? 3 : 1), 0) };
  }).filter(Boolean).sort((a, z) => z.score - a.score).map(x => x.e);
}

const CSS = `:root{--bg:#f7f5f0;--fg:#1d1b18;--muted:#5c574f;--card:#fff;--line:#e2dcd1;--accent:#8a3ffc;--accent-fg:#fff;--ok:#1f7a3a;--warn:#9a5b00;--bad:#b42318;--chip:#efe9df}
@media (prefers-color-scheme:dark){:root{--bg:#141311;--fg:#f0ece5;--muted:#b0a898;--card:#1f1d1a;--line:#37332d;--accent:#b794ff;--accent-fg:#160b2b;--ok:#7fd49a;--warn:#f2b45c;--bad:#f39087;--chip:#2a2722}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:var(--accent)}a:focus-visible,button:focus-visible,input:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
header.top{border-bottom:1px solid var(--line);background:var(--card)}header.top nav{max-width:1080px;margin:0 auto;padding:8px 16px;display:flex;gap:4px;align-items:center;flex-wrap:wrap}
header.top a{display:inline-flex;align-items:center;min-height:44px;padding:0 10px;border-radius:10px;text-decoration:none;color:var(--fg)}header.top a:hover{background:var(--chip)}
header.top a.brand{font-weight:800;font-size:1.15rem;margin-right:auto;letter-spacing:-.01em}header.top a.brand span{color:var(--accent)}
main{max-width:1080px;margin:0 auto;padding:24px 16px 72px}h1{font-size:clamp(1.8rem,5vw,2.6rem);line-height:1.15;margin:8px 0 10px;letter-spacing:-.02em}
h2{font-size:1.3rem;margin:36px 0 12px}h3{font-size:1.05rem;margin:0 0 6px}.lede{font-size:1.1rem;color:var(--muted);max-width:720px;margin:0 0 20px}.muted{color:var(--muted)}.small{font-size:.9rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.tile{display:block;min-height:120px;padding:16px;border-radius:16px;text-decoration:none;color:var(--fg);border:1px solid var(--line);background:linear-gradient(160deg,hsl(var(--h) 70% 55% / .18),hsl(var(--h) 70% 55% / .04));transition:transform .15s}
.tile:hover{transform:translateY(-2px)}.tile b{display:block;font-size:1.05rem}.tile .n{font-size:2rem;font-weight:800;color:hsl(var(--h) 60% 45%)}
@media (prefers-color-scheme:dark){.tile .n{color:hsl(var(--h) 70% 70%)}}
.card{display:flex;flex-direction:column;gap:8px;background:var(--card);border:1px solid var(--line);border-left:5px solid hsl(var(--h) 65% 50%);border-radius:14px;padding:14px 16px;text-decoration:none;color:var(--fg);min-height:44px;transition:transform .15s}
.card:hover{transform:translateY(-2px);border-color:hsl(var(--h) 65% 50%)}.belief{font-weight:650;line-height:1.35}.belief::before{content:"\\201C"}.belief::after{content:"\\201D"}
.card .tag{align-self:flex-start}.tag{display:inline-block;font-size:.8rem;font-weight:650;padding:2px 9px;border-radius:99px;background:var(--chip);color:var(--muted)}.row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.meter{display:inline-flex;gap:3px;vertical-align:middle}.meter i{width:12px;height:12px;border-radius:3px;background:var(--line)}.meter i.on{background:var(--accent)}
.dir{font-size:.85rem;font-weight:650}.dir.contradicts,.dir.mostly-contradicts,.dir.unsupported{color:var(--bad)}.dir.mixed{color:var(--warn)}.dir.complicates{color:var(--warn)}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}.chips button,.btn{font:inherit;min-height:44px;padding:0 16px;border-radius:99px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
.chips button[aria-pressed=true]{border-color:var(--accent);color:var(--accent);font-weight:700}.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-fg);font-weight:700}
.pill{display:flex;gap:8px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:99px;padding:4px 4px 4px 18px;max-width:560px;margin:0 0 20px}
.pill input{flex:1;border:0;background:transparent;color:var(--fg);font:inherit;min-height:44px;outline:none}
.stats{display:flex;flex-wrap:wrap;gap:18px;margin:6px 0 24px}.stats div{min-width:110px}.stats b{display:block;font-size:1.6rem;line-height:1.1}
.step{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;margin:14px 0}.step .k{font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;font-weight:800;color:var(--accent);margin-bottom:4px}
.opts{display:grid;gap:8px;margin-top:10px}.opts button{font:inherit;text-align:left;min-height:48px;padding:10px 14px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer}
.opts button.right{border-color:var(--ok);background:color-mix(in srgb,var(--ok) 14%,transparent)}.opts button.wrong{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 12%,transparent)}
details.reveal>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:700;color:var(--accent)}
.src{border-top:1px solid var(--line);padding:10px 0}.src:first-child{border-top:0}.hero{padding:10px 0 4px}
blockquote.b{font-size:clamp(1.3rem,3.5vw,1.8rem);font-weight:700;line-height:1.3;margin:6px 0 14px;padding-left:14px;border-left:5px solid hsl(var(--h) 65% 50%)}
.play{max-width:640px;margin:0 auto}footer{max-width:1080px;margin:0 auto;padding:24px 16px 48px;color:var(--muted);font-size:.9rem;border-top:1px solid var(--line)}
.badge{display:inline-block;align-self:flex-start;font-size:.8rem;font-weight:700;padding:2px 9px;border-radius:99px;border:1px solid var(--line);color:var(--muted)}.badge.ok{color:var(--ok);border-color:var(--ok)}.badge.warn{color:var(--warn);border-color:var(--warn)}
.okbox{border-color:var(--ok)}.warnbox{border-color:var(--warn)}blockquote.q{margin:6px 0;padding-left:10px;border-left:3px solid var(--line);color:var(--muted);font-style:italic}
[hidden]{display:none!important}@media (prefers-reduced-motion:reduce){*{transition:none!important}}`;

export function layout(title, body, { desc = "", script = "", path = "/" } = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc || "Unlearn: popular beliefs where the evidence points another way, with graded evidence and named sources.")}">
<link rel="canonical" href="https://unlearn.ultrastable.org${esc(path)}"><style>${CSS}</style></head><body>
<header class="top"><nav aria-label="Main"><a class="brand" href="/">Un<span>learn</span></a><a href="/topics">Topics</a><a href="/play">Play</a><a href="/lab">Lab</a><a href="/how">How it works</a><a href="/coach">Coach a child</a></nav></header>
<main>${body}</main>
<footer>Unlearn runs on <a href="https://ultrastable.io">Ultrastable</a>, the foundation for any autonomous system. Every entry cites its sources; an hourly loop checks them and watches for new reviews. Data: <a href="/api/entries.json">/api/entries.json</a>.</footer>
${script ? `<script>${script}</script>` : ""}</body></html>`;
}

export const meter = s => `<span class="meter" role="img" aria-label="Evidence: ${esc(STRENGTH[s].name)}">${[1, 2, 3, 4].map(i => `<i class="${i <= STRENGTH[s].rank ? "on" : ""}"></i>`).join("")}</span>`;
const dir = d => `<span class="dir ${esc(d)}">${esc(DIRECTION[d].name)}</span>`;

// The grade a reader sees: the entry's own grade, moved one step up when the automatic re-grade found it reinforced (lab.js regrade).
export const shown = (e, g) => (g && g.status === "reinforced" ? g.strength : e.strength);
const badge = g => g && g.status === "reinforced" ? `<span class="badge ok">Reinforced by newer reviews</span>` : g && g.status === "challenged" ? `<span class="badge warn">Under review: newer evidence disagrees</span>` : "";
export function card(e, grades = {}) {
  const c = catOf(e.cat), g = grades[e.id], st = shown(e, g);
  return `<a class="card" href="/e/${esc(e.id)}" style="--h:${c.hue}" data-strength="${esc(st)}" data-dir="${esc(e.direction)}" data-cat="${esc(e.cat)}">
<span class="tag">${esc(c.name)}</span><span class="belief">${esc(e.belief)}</span><span class="row">${meter(st)} <span class="small muted">${esc(STRENGTH[st].name)} evidence</span></span>${dir(e.direction)}${badge(g)}</a>`;
}

const FILTERS = `<div class="chips" role="group" aria-label="Filter by evidence"><button aria-pressed="true" data-f="all">All</button><button aria-pressed="false" data-f="strong">Strong evidence</button><button aria-pressed="false" data-f="moderate">Moderate</button><button aria-pressed="false" data-f="mixed">Split or limited</button></div>`;
const FILTER_JS = `document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-pressed',x===b));const f=b.dataset.f;document.querySelectorAll('.card').forEach(c=>{const s=c.dataset.strength;c.hidden=!(f==='all'||s===f||(f==='mixed'&&(s==='mixed'||s==='limited')))})});`;

export function home({ stats = {}, surprising = [], grades = {} } = {}) {
  const C = e => card(e, grades);
  const nSrc = ENTRIES.reduce((n, e) => n + e.sources.length, 0);
  const tiles = CATEGORIES.map(c => `<a class="tile" href="/topics/${c.id}" style="--h:${c.hue}"><span class="n">${ENTRIES.filter(e => e.cat === c.id).length}</span><b>${esc(c.name)}</b><span class="small muted">${esc(c.blurb)}</span></a>`).join("");
  const surp = surprising.length ? `<h2>Most surprising so far</h2><p class="muted small">Entries where most readers guessed wrong before seeing the evidence. Measured from anonymous taps.</p><div class="grid">${surprising.map(x => C(byId[x.entry])).join("")}</div>` : "";
  return layout("Unlearn: what the evidence says about what everyone knows", `<section class="hero">
<h1>Some of what everyone knows is wrong.</h1>
<p class="lede">Popular beliefs about crime, children, the mind, money and society, set against the best evidence. Guess first, then see what the studies found, why the belief feels true, and what works instead.</p>
<div class="row" style="margin-bottom:18px"><a class="btn primary" href="/play">Test your intuition</a><a class="btn" href="/topics">Browse by topic</a></div>
<div class="stats"><div><b>${ENTRIES.length}</b><span class="small muted">beliefs examined</span></div><div><b>${nSrc}</b><span class="small muted">studies cited</span></div><div><b>${stats.leads ?? 0}</b><span class="small muted">new reviews found by the loop</span></div><div><b>${stats.guesses ?? 0}</b><span class="small muted">guesses made</span></div></div>
<form class="pill" action="/search" role="search"><input name="q" aria-label="Search beliefs" placeholder="Search: prison, sugar, memory, minimum wage"><button class="btn primary" type="submit">Search</button></form></section>
<h2>Topics</h2><div class="tiles">${tiles}</div>${surp}
<h2>All entries</h2>${FILTERS}<div class="grid">${ENTRIES.map(C).join("")}</div>`, { script: FILTER_JS, desc: "Popular beliefs where the evidence points another way: graded evidence, named sources, and a loop that keeps checking them." });
}

export function topics(grades = {}) {
  return layout("Topics · Unlearn", `<h1>Topics</h1><p class="lede">${ENTRIES.length} beliefs in ${CATEGORIES.length} topics.</p>${CATEGORIES.map(c => `<h2 id="${c.id}"><a href="/topics/${c.id}">${esc(c.name)}</a></h2><p class="muted">${esc(c.blurb)}</p><div class="grid">${ENTRIES.filter(e => e.cat === c.id).map(e => card(e, grades)).join("")}</div>`).join("")}`, { path: "/topics" });
}

export function topic(id, grades = {}) {
  const c = catOf(id); if (!c) return null;
  const list = ENTRIES.filter(e => e.cat === id);
  return layout(c.name + " · Unlearn", `<p class="small"><a href="/topics">Topics</a></p><h1>${esc(c.name)}</h1><p class="lede">${esc(c.blurb)}</p>${FILTERS}<div class="grid">${list.map(e => card(e, grades)).join("")}</div>`, { script: FILTER_JS, path: "/topics/" + id });
}

export function entryPage(e, { dois = {}, leads = [], counts = {}, grade = null, slip = null, variant = null } = {}) {
  const c = catOf(e.cat), g = e.guess, st = shown(e, grade);
  const guesses = g.options.reduce((n, _, i) => n + (counts["guess:" + i] || 0), 0);
  const right = guesses ? Math.round(100 * (counts["guess:" + g.answer] || 0) / guesses) : null;
  const srcs = e.sources.map((s, i) => { const L = sourceLinks(s, dois[i]); return `<div class="src"><b>${esc(s.authors)} (${s.year}).</b> ${esc(s.title)}. <i>${esc(s.venue)}</i>.<br><span class="tag">${esc(DESIGN[s.design].name)}</span> ${esc(s.finding)}<br><span class="small">${L.doi ? `<a href="${esc(L.doi)}">DOI ${esc(dois[i])}</a> · ` : ""}<a href="${esc(L.scholar)}">Find on Google Scholar</a> · <a href="${esc(L.epmc)}">Europe PMC</a></span></div>`; }).join("");
  const STANCE = { supports_belief: ["Supports the belief", "warn"], contradicts_belief: ["Points the same way as this entry", "ok"], mixed: ["Mixed", "warn"], unrelated: ["Does not test the belief", ""] };
  const leadHtml = leads.length ? `<div class="step"><div class="k">New evidence the loop found</div><p class="small muted">Reviews published since this entry was written, found automatically on Europe PMC. A model reads each abstract and labels it; every label quotes a sentence from the abstract, and only those labels move the grade.</p>${leads.map(l => `<div class="src"><a href="${esc(l.url)}">${esc(l.title)}</a> <span class="small muted">${esc(l.venue)}${l.year ? ", " + l.year : ""}</span>${l.stance && STANCE[l.stance] ? `<br><span class="badge ${STANCE[l.stance][1]}">${esc(STANCE[l.stance][0])}</span>` : ""}${l.quote ? `<blockquote class="q">${esc(l.quote)}</blockquote>` : ""}</div>`).join("")}</div>` : "";
  const gradeHtml = grade && grade.status !== "stable" ? `<div class="step ${grade.status === "challenged" ? "warnbox" : "okbox"}"><div class="k">${grade.status === "challenged" ? "Under review" : "Reinforced"}</div><p style="margin:0">${esc(grade.why)}${grade.status === "reinforced" && grade.strength !== grade.base_strength ? ` Grade raised from ${esc(STRENGTH[grade.base_strength].name.toLowerCase())} to ${esc(STRENGTH[grade.strength].name.toLowerCase())}.` : ""}</p></div>` : "";
  const rel = (e.related || []).map(id => byId[id]).filter(Boolean);
  const body = `<p class="small"><a href="/topics/${c.id}">${esc(c.name)}</a></p>
<p class="small muted" style="margin:0">The belief</p><blockquote class="b" style="--h:${c.hue}">${esc(e.belief)}</blockquote>
<div class="row">${meter(st)} <span class="small">${esc(STRENGTH[st].name)} evidence</span> · ${dir(e.direction)}</div>${gradeHtml}
<div class="step"><div class="k">Why it feels true</div><p style="margin:0">${esc(e.feels)}</p></div>
<div class="step" id="guess" data-entry="${esc(e.id)}" data-answer="${g.answer}"><div class="k">Your guess</div><p style="margin:0"><b>${esc(g.q)}</b></p>
<div class="opts">${g.options.map((o, i) => `<button type="button" data-i="${i}">${esc(o)}</button>`).join("")}</div><p class="small muted" id="gr" aria-live="polite">${right === null ? "" : `${right}% of ${guesses} readers guessed right.`}</p></div>
<details class="reveal" id="rv"><summary>See what the evidence shows</summary>
<div class="step"><div class="k">What the evidence shows</div><p style="margin:0">${esc(e.says)}</p></div>
<div class="step"><div class="k">Where the intuition slips</div><p style="margin:0">${esc(slip || e.slip)}</p></div>
<div class="step"><div class="k">What works instead</div><p style="margin:0">${esc(e.instead)}</p></div>
<div class="step"><div class="k">Where the belief may still hold</div><p style="margin:0">${esc(e.holds)}</p></div>
<div class="step"><div class="k">Sources (${e.sources.length})</div><p class="small muted">${esc(STRENGTH[st].note)} ${esc(DIRECTION[e.direction].note)}</p>${srcs}</div>
${leadHtml}
<div class="step" id="shift" data-entry="${esc(e.id)}"${variant ? ` data-variant="${variant}"` : ""}><div class="k">Did this change how you see it?</div><div class="row"><button class="btn" data-s="yes">Yes</button><button class="btn" data-s="some">A little</button><button class="btn" data-s="no">No</button></div><p class="small muted" id="sr" aria-live="polite"></p></div>
</details>
${rel.length ? `<h2>Related</h2><div class="grid">${rel.map(x => card(x)).join("")}</div>` : ""}`;
  const js = `const G=document.getElementById('guess'),A=+G.dataset.answer,E=G.dataset.entry;let done=false;
G.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(done)return;done=true;const i=+b.dataset.i;G.querySelectorAll('button').forEach(x=>{const j=+x.dataset.i;if(j===A)x.classList.add('right');else if(j===i)x.classList.add('wrong')});
document.getElementById('gr').textContent=i===A?'You called it. Here is the evidence.':'Most beliefs feel true for good reasons. Here is what the studies found.';document.getElementById('rv').open=true;
fetch('/api/guess',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({entry:E,choice:i})}).catch(()=>{})});
const S=document.getElementById('shift');document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-s]').forEach(x=>x.disabled=true);document.getElementById('sr').textContent='Thanks. Counted anonymously.';
fetch('/api/shift',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({entry:E,shift:b.dataset.s},S.dataset.variant?{variant:+S.dataset.variant}:{}))}).catch(()=>{})});`;
  return layout(e.belief + " · Unlearn", body, { script: js, path: "/e/" + e.id, desc: "Belief: " + e.belief + " " + DIRECTION[e.direction].name + " (" + STRENGTH[st].name.toLowerCase() + " evidence)." });
}

export function searchPage(q) {
  const res = search(q);
  return layout("Search · Unlearn", `<h1>Search</h1><form class="pill" action="/search" role="search"><input name="q" value="${esc(q)}" aria-label="Search beliefs"><button class="btn primary" type="submit">Search</button></form>
<p class="muted">${q ? `${res.length} result${res.length === 1 ? "" : "s"} for "${esc(q)}".` : "Type a word: prison, sugar, memory, wages."}</p><div class="grid">${res.map(x => card(x)).join("")}</div>`, { path: "/search" });
}

export function playPage() {
  const data = ENTRIES.map(e => ({ id: e.id, b: e.belief, q: e.guess.q, o: e.guess.options, a: e.guess.answer, s: e.says, st: STRENGTH[e.strength].name, d: DIRECTION[e.direction].name, c: catOf(e.cat).name, h: catOf(e.cat).hue }));
  const js = `const D=${JSON.stringify(data).replace(/</g, "\\u003c")};for(let i=D.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[D[i],D[j]]=[D[j],D[i]]}
let k=0,right=0,seen=0;const $=id=>document.getElementById(id);const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function show(){const x=D[k%D.length];$('cat').textContent=x.c;$('bel').textContent=x.b;$('bel').style.setProperty('--h',x.h);$('q').textContent=x.q;$('res').hidden=true;
$('opts').innerHTML=x.o.map((o,i)=>'<button type="button" data-i="'+i+'">'+esc(o)+'</button>').join('');
$('opts').querySelectorAll('button').forEach(b=>b.onclick=()=>pick(x,+b.dataset.i))}
function pick(x,i){if(!$('res').hidden)return;seen++;if(i===x.a)right++;$('opts').querySelectorAll('button').forEach(b=>{const j=+b.dataset.i;if(j===x.a)b.classList.add('right');else if(j===i)b.classList.add('wrong')});
$('verdict').textContent=(i===x.a?'Right. ':'Not quite. ')+x.d+' ('+x.st.toLowerCase()+' evidence).';$('says').textContent=x.s;$('more').href='/e/'+x.id;$('res').hidden=false;$('score').textContent=right+' of '+seen+' right';
fetch('/api/guess',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({entry:x.id,choice:i})}).catch(()=>{})}
$('next').onclick=()=>{k++;show();$('bel').focus()};show();`;
  return layout("Test your intuition · Unlearn", `<div class="play"><h1>Test your intuition</h1><p class="lede">One belief at a time. Make a guess, then see what the evidence found. <span id="score" class="tag">0 of 0 right</span></p>
<div class="step"><span class="tag" id="cat"></span><blockquote class="b" id="bel" tabindex="-1"></blockquote><p style="margin:0"><b id="q"></b></p><div class="opts" id="opts"></div>
<div id="res" hidden aria-live="polite"><p><b id="verdict"></b></p><p id="says"></p><div class="row"><a class="btn" id="more" href="/">Read the full entry</a><button class="btn primary" id="next" type="button">Next belief</button></div></div></div>
<noscript><p>Play mode needs script. <a href="/topics">Browse every entry instead</a>.</p></noscript></div>`, { script: js, path: "/play" });
}

export function howPage({ fresh, metrics }) {
  return layout("How it works · Unlearn", `<h1>How Unlearn works</h1>
<p class="lede">Telling people they are wrong rarely changes a mind. Unlearn is built so readers can revise a belief themselves: it starts from why the belief is reasonable, asks for a guess, then shows the evidence, explains the slip, and offers something to believe instead.</p>
<h2>The order of every entry</h2><ol>${FORMAT.map(f => `<li>${esc({ feels: "Why it feels true", guess: "Your guess, before any evidence", says: "What the evidence shows", slip: "Where the intuition slips", instead: "What works instead", holds: "Where the belief may still hold", sources: "Sources, each with its study design" }[f])}</li>`).join("")}</ol>
<h2>The research this format follows</h2>${METHOD.map(m => `<div class="src"><b>${esc(m.cite)}.</b> ${esc(m.applies)}</div>`).join("")}
<h2>How evidence is graded</h2><p>Two separate readings: how strong the body of evidence is, and which way it points. A belief can be contradicted by limited evidence, or the evidence can be strong and split.</p>
${Object.entries(STRENGTH).map(([k, s]) => `<div class="src">${meter(k)} <b>${esc(s.name)}.</b> ${esc(s.note)}</div>`).join("")}
${Object.entries(DIRECTION).map(([k, d]) => `<div class="src">${dir(k)}. ${esc(d.note)}</div>`).join("")}
<h2>The loop that keeps it current</h2><p>Every hour the beat checks ${EVIDENCE.batch} entries: it resolves each cited study to a DOI through Crossref (kept only when the title and year match), and searches Europe PMC for systematic reviews and meta-analyses published since the entry was last checked. New reviews appear on the entry as "New evidence the loop found". When ${EVIDENCE.review_after_leads} or more pile up, the entry goes on the <a href="/api/review-queue.json">review queue</a> for re-grading.</p>
<div class="stats"><div><b>${fresh.checked}/${fresh.entries}</b><span class="small muted">entries checked in the last ${EVIDENCE.recheck_days} days</span></div><div><b>${metrics.sources_resolved}/${metrics.sources_total}</b><span class="small muted">sources matched to a DOI</span></div><div><b>${metrics.leads}</b><span class="small muted">new reviews found</span></div><div><b>${metrics.shift_share === null ? "n/a" : Math.round(metrics.shift_share * 100) + "%"}</b><span class="small muted">of readers who answered said it shifted their view</span></div></div>
<p class="small">Live numbers: <a href="/api/freshness">/api/freshness</a> · <a href="/api/metrics">/api/metrics</a> · <a href="/health">/health</a></p>
<h2>How it improves itself</h2><p>Three more loops run on the same beat, each with a guard so nothing unchecked reaches an entry:</p><ol>
<li><b>Reading new reviews.</b> A model reads each new review's abstract and labels it: supports the belief, points the same way as the entry, mixed, or does not test it. The label is kept only when it quotes a sentence that is really in the abstract. When ${LAB.regrade_min} or more newer reviews point the same way, the entry is marked reinforced and its grade rises one step; when ${LAB.regrade_min} or more support the belief, the entry is marked "under review" on the page and goes on the <a href="/api/review-queue.json">review queue</a> to be re-written.</li>
<li><b>Finding new beliefs.</b> Once a day it searches Europe PMC for reviews about myths and misconceptions, drafts a candidate belief from the abstract alone (again with a quote that must be in it, and no numbers or names the abstract lacks), and shows it in the <a href="/lab">Lab</a>. Readers vote on which deserve a full entry. A draft is never published as an entry by itself.</li>
<li><b>Better explanations.</b> When an entry changes few minds, the model re-words "Where the intuition slips" from the entry's own text, with no new facts. Half the readers see the new wording; the "did this change how you see it" taps decide. The new wording wins only on a clear difference (two-proportion test, at least ${LAB.variant_min_arm} answers each); otherwise the original stays.</li></ol>
${metrics.lab ? `<div class="stats"><div><b>${metrics.lab.reviews_classified}</b><span class="small muted">new reviews read and labelled</span></div><div><b>${metrics.lab.entries_reinforced}</b><span class="small muted">entries reinforced</span></div><div><b>${metrics.lab.entries_challenged}</b><span class="small muted">entries under review</span></div><div><b>${metrics.lab.candidates.drafted || 0}</b><span class="small muted">candidate beliefs in the Lab</span></div></div>` : ""}
<h2>Why "Unlearn"</h2><p>The name comes from a line in Rutger Bregman's <i>Humankind</i>, chapter "Homo Ludens": coaches at the Agora school "have to unlearn much of their training as teachers." The same applies to all of us. Unlearn also keeps its original tool for the adults around curious children: <a href="/coach">coach a child's curiosity</a>.</p>
<h2>What it keeps</h2><p>No accounts and no cookies. A guess or a "did this change your view" tap is counted per entry with nothing that identifies the reader.</p>`, { path: "/how" });
}

export function sitemap() {
  const urls = ["/", "/topics", "/play", "/lab", "/how", "/coach", ...CATEGORIES.map(c => "/topics/" + c.id), ...ENTRIES.map(e => "/e/" + e.id)];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>https://unlearn.ultrastable.org${u}</loc></url>`).join("")}</urlset>`;
}

export function entryJson(e, dois = {}) {
  return { id: e.id, url: "https://unlearn.ultrastable.org/e/" + e.id, category: e.cat, belief: e.belief, strength: e.strength, direction: e.direction,
    why_it_feels_true: e.feels, guess: e.guess, evidence: e.says, where_it_slips: e.slip, instead: e.instead, still_holds: e.holds,
    sources: e.sources.map((s, i) => ({ ...s, doi: dois[i] || null })), watch_query: e.query, related: e.related || [] };
}

export function labPage({ candidates = [], trials = [], metrics = {} } = {}) {
  const items = candidates.map(c => `<div class="step" data-c="${c.id}"><div class="k">Candidate belief</div><blockquote class="b" style="--h:300">${esc(c.draft.belief)}</blockquote>
<p style="margin:0">${esc(c.draft.says)}</p><blockquote class="q">${esc(c.draft.quote)}</blockquote>
<p class="small"><a href="${esc(c.url)}">${esc(c.title)}</a> <span class="muted">${esc(c.venue)}${c.year ? ", " + c.year : ""}</span></p>
<div class="row"><span class="small muted">Should this become a full entry?</span><button class="btn" data-v="yes">Yes</button><button class="btn" data-v="no">No</button><span class="small muted" aria-live="polite">${c.yes + c.no ? `${c.yes} yes, ${c.no} no` : ""}</span></div></div>`).join("");
  const tr = trials.length ? `<h2>Wording trials</h2><p class="muted small">Where a re-worded explanation is being tested against the original on "did this change how you see it".</p>${trials.map(t => `<div class="src"><a href="/e/${esc(t.entry)}">${esc((byId[t.entry] || {}).belief || t.entry)}</a> <span class="tag">${esc(t.arm === "control" ? "original" : "new wording")}</span> <span class="tag">${esc(t.status)}</span> <span class="small muted">${t.yes} of ${t.total} shifted</span><br><span class="small">${esc(t.text)}</span></div>`).join("")}` : "";
  const js = `document.querySelectorAll('[data-c]').forEach(d=>d.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{d.querySelectorAll('[data-v]').forEach(x=>x.disabled=true);b.setAttribute('aria-pressed','true');d.querySelector('[aria-live]').textContent='Thanks. Counted anonymously.';
fetch('/api/candidate-vote',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:+d.dataset.c,vote:b.dataset.v})}).catch(()=>{})}));`;
  return layout("Lab · Unlearn", `<h1>The Lab</h1><p class="lede">Beliefs the loop found in new research reviews and has not written up yet. Each draft comes from one review's abstract, with a sentence quoted from it. These are drafts, not entries: they have not been graded.</p>
<div class="stats"><div><b>${(metrics.candidates && metrics.candidates.drafted) || 0}</b><span class="small muted">drafts open</span></div><div><b>${metrics.reviews_classified || 0}</b><span class="small muted">new reviews labelled</span></div><div><b>${(metrics.wording_trials && metrics.wording_trials.winner) || 0}</b><span class="small muted">better wordings kept</span></div></div>
${items || `<p class="muted">No drafts yet. The loop searches once a day; drafts appear here as it finds reviews that test a popular belief.</p>`}${tr}
<p class="small"><a href="/how">How the loops work</a> · <a href="/api/candidates.json">/api/candidates.json</a></p>`, { script: js, path: "/lab", desc: "Candidate beliefs Unlearn's loop found in new research reviews, waiting for readers' votes." });
}

export function notFound() {
  return layout("Not found · Unlearn", `<h1>Nothing here</h1><p class="lede">That page does not exist. Try a topic, or search.</p><form class="pill" action="/search" role="search"><input name="q" aria-label="Search beliefs"><button class="btn primary" type="submit">Search</button></form><p><a class="btn" href="/topics">Browse topics</a></p>`);
}
