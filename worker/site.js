// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// The encyclopedia's pages, rendered on the server from entries.js so every page works with no script, is indexable, and comes from the
// same data as /api/entries.json. Script only adds the point-and-click parts: guess buttons, filters, play mode. Light and dark, 16 px
// body, 44 px targets, visible focus, reduced motion respected. No cookies, no trackers.
import { ENTRIES, CATEGORIES, STRENGTH, DIRECTION, DESIGN, METHOD, FORMAT } from "./entries.js";
import { EVIDENCE } from "./evidence.js";
import { LAB, mythOfDay } from "./lab.js";
import { CHANGE, REASONS, rankPlans } from "./change.js";
import { OVERSOLD } from "./practices.js";
import { SIBLINGS } from "./promote.js";
import { footerLinks, statementsHtml } from "../vendor/ultrastable/contract.js";
import { SPEC } from "./contract.js";

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
ol.timeline{list-style:none;margin:14px 0;padding:0 0 0 18px;border-left:3px solid var(--accent)}ol.timeline li{position:relative;margin:0 0 12px}ol.timeline li::before{content:"";position:absolute;left:-26px;top:6px;width:13px;height:13px;border-radius:99px;background:var(--accent)}ol.timeline .k{display:block;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;font-weight:800;color:var(--accent)}
.today .card{max-width:560px}
fieldset.plans{border:0;padding:0;margin:8px 0;display:grid;gap:8px}label.opt{display:flex;gap:10px;align-items:flex-start;min-height:44px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--bg);cursor:pointer}label.opt input{margin-top:5px}
.kit input[type=text],.kit input:not([type]),[data-ed] input,#own input{font:inherit;min-height:44px;width:100%;padding:0 10px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--fg);margin:2px 0 8px}
.dots{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0 10px}.dots i{width:16px;height:16px;border-radius:4px;background:var(--line)}.dots i.y{background:var(--ok)}.dots i.p{background:var(--warn)}.dots i.n{background:transparent;border:2px solid var(--line)}
[hidden]{display:none!important}@media (prefers-reduced-motion:reduce){*{transition:none!important}}`;

export function layout(title, body, { desc = "", script = "", path = "/" } = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc || "Unlearn: popular beliefs where the evidence points another way, with graded evidence and named sources.")}">
<link rel="canonical" href="https://unlearn.ultrastable.org${esc(path)}"><link rel="alternate" type="application/atom+xml" title="Unlearn: myth of the day" href="/feed.xml"><link rel="alternate" type="application/feed+json" title="Unlearn: myth of the day" href="/feed.json"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><style>${CSS}</style></head><body>
<header class="top"><nav aria-label="Main"><a class="brand" href="/">Un<span>learn</span></a><a href="/today">Today</a><a href="/topics">Topics</a><a href="/change">Change</a><a href="/play">Play</a><a href="/lab">Lab</a><a href="/graph">Graph</a><a href="/how">How it works</a><a href="/coach">Coach a child</a></nav></header>
<main>${body}${statementsHtml(SPEC, path)}</main>
<footer>Unlearn runs on <a href="https://ultrastable.io">Ultrastable</a>, the foundation for any autonomous system. Every entry cites its sources; an hourly loop checks them and watches for new reviews. Data: <a href="/api/entries.json">/api/entries.json</a>. Follow along: <a href="/feed.xml">feed</a>.${SIBLINGS.length ? ` Also run on Ultrastable: ${SIBLINGS.map(x => `<a href="${esc(x.home)}">${esc(x.name)}</a>`).join(", ")}.` : ""}<br>${footerLinks(SPEC)}</footer>
${script ? `<script>${script}</script>` : ""}</body></html>`;
}

// A daily streak kept only in the reader's own browser (localStorage): no cookie, nothing sent anywhere. A day counts when the reader makes a guess.
export const STREAK_JS = `function streak(){let d=[];try{d=JSON.parse(localStorage.getItem('unlearn-days')||'[]')}catch(e){}const t=Math.floor(Date.now()/864e5);if(d[d.length-1]!==t)d.push(t);d=d.slice(-400);try{localStorage.setItem('unlearn-days',JSON.stringify(d))}catch(e){}let n=1;for(let i=d.length-1;i>0&&d[i]-d[i-1]===1;i--)n++;return n}
function streakText(n){return n>1?' Day '+n+' in a row. Come back tomorrow for a new one.':' Come back tomorrow for a new myth of the day.'}`;
export const meter = s => `<span class="meter" role="img" aria-label="Evidence: ${esc(STRENGTH[s].name)}">${[1, 2, 3, 4].map(i => `<i class="${i <= STRENGTH[s].rank ? "on" : ""}"></i>`).join("")}</span>`;
const dir = d => `<span class="dir ${esc(d)}">${esc(DIRECTION[d].name)}</span>`;

// The grade a reader sees: the entry's own grade, moved one step up when the automatic re-grade found it reinforced (lab.js regrade).
export const shown = (e, g) => (g && g.status === "reinforced" ? g.strength : e.strength);
const badge = g => g && g.status === "reinforced" ? `<span class="badge ok">Reinforced by newer reviews</span>` : g && g.status === "challenged" ? `<span class="badge warn">Under review: newer evidence disagrees</span>` : "";
export function card(e, grades = {}) {
  const c = catOf(e.cat), g = grades[e.id], st = shown(e, g);
  return `<a class="card" href="/e/${esc(e.id)}" style="--h:${c.hue}" data-strength="${esc(st)}" data-dir="${esc(e.direction)}" data-cat="${esc(e.cat)}">
<span class="tag">${esc(c.name)}</span><span class="belief">${esc(e.belief)}</span><span class="row">${meter(st)} <span class="small muted">${esc(STRENGTH[st].name)} evidence</span></span>${dir(e.direction)}${badge(g)}${e.change ? `<span class="badge ok">Try it: ${esc(e.change.days)}-day trial</span>` : ""}</a>`;
}

const FILTERS = `<div class="chips" role="group" aria-label="Filter by evidence"><button aria-pressed="true" data-f="all">All</button><button aria-pressed="false" data-f="strong">Strong evidence</button><button aria-pressed="false" data-f="moderate">Moderate</button><button aria-pressed="false" data-f="mixed">Split or limited</button></div>`;
const FILTER_JS = `document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-pressed',x===b));const f=b.dataset.f;document.querySelectorAll('.card').forEach(c=>{const s=c.dataset.strength;c.hidden=!(f==='all'||s===f||(f==='mixed'&&(s==='mixed'||s==='limited')))})});`;

export function home({ stats = {}, surprising = [], grades = {}, today = null, drafts = [] } = {}) {
  const C = e => card(e, grades);
  const nSrc = ENTRIES.reduce((n, e) => n + e.sources.length, 0);
  const tile = c => `<a class="tile" href="/topics/${c.id}" style="--h:${c.hue}"><span class="n">${ENTRIES.filter(e => e.cat === c.id).length}</span><b>${esc(c.name)}</b><span class="small muted">${esc(c.blurb)}</span></a>`;
  const tiles = CATEGORIES.filter(c => c.kind !== "change").map(tile).join(""), ctiles = CATEGORIES.filter(c => c.kind === "change").map(tile).join("");
  const surp = surprising.length ? `<h2>Most surprising so far</h2><p class="muted small">Entries where most readers guessed wrong before seeing the evidence. Measured from anonymous taps.</p><div class="grid">${surprising.map(x => C(byId[x.entry])).join("")}</div>` : "";
  return layout("Unlearn: what the evidence says about what everyone knows", `<section class="hero">
<h1>Some of what everyone knows is wrong.</h1>
<p class="lede">Popular beliefs about crime, children, the mind, money and society, set against the best evidence. Guess first, then see what the studies found, why the belief feels true, and what works instead.</p>
<div class="row" style="margin-bottom:18px"><a class="btn primary" href="/play">Test your intuition</a><a class="btn" href="/topics">Browse by topic</a></div>
<div class="stats"><div><b>${ENTRIES.length}</b><span class="small muted">beliefs examined</span></div><div><b>${nSrc}</b><span class="small muted">studies cited</span></div><div><b>${stats.leads ?? 0}</b><span class="small muted">new reviews found by the loop</span></div><div><b>${stats.guesses ?? 0}</b><span class="small muted">guesses made</span></div></div>
<form class="pill" action="/search" role="search"><input name="q" aria-label="Search beliefs" placeholder="Search: prison, sugar, memory, minimum wage"><button class="btn primary" type="submit">Search</button></form></section>
${today ? `<h2>Myth of the day</h2><div class="today">${card(today, grades)}<p class="small muted">A new one every day, in a fixed order that goes through every entry before any repeats. <a href="/feed.xml">Follow the feed</a>.</p></div>` : ""}
<h2>Topics</h2><div class="tiles">${tiles}</div>
<h2>Change what you do</h2><p class="muted small">Practices where the evidence says the usual way of trying to change is not the one that works, each with a small trial you can start in a minute. <a href="/change">See all</a> · <a href="/plan">My plans</a></p><div class="tiles">${ctiles}</div>${surp}${drafts.length ? `<h2>New from the Lab</h2><p class="muted small">Drafts the loop wrote from new research and readers voted up. Each is from one paper and not yet graded.</p><div class="grid">${drafts.map(draftCard).join("")}</div>` : ""}
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

export function entryPage(e, { dois = {}, leads = [], counts = {}, grade = null, slip = null, variant = null, connections = [] } = {}) {
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
${e.classic ? `<ol class="timeline" aria-label="The famous story and what came later"><li><span class="k">The famous story</span>${esc(e.classic.then)}</li><li><span class="k">What came later</span>${esc(e.classic.now)}</li></ol>` : ""}
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
${kit(e, counts)}
${rel.length ? `<h2>Related</h2><div class="grid">${rel.map(x => card(x)).join("")}</div>` : ""}
${connectionsHtml(connections)}`;
  const js = `const G=document.getElementById('guess'),A=+G.dataset.answer,E=G.dataset.entry;let done=false;
G.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(done)return;done=true;const i=+b.dataset.i;G.querySelectorAll('button').forEach(x=>{const j=+x.dataset.i;if(j===A)x.classList.add('right');else if(j===i)x.classList.add('wrong')});
document.getElementById('gr').textContent=(i===A?'You called it. Here is the evidence.':'Most beliefs feel true for good reasons. Here is what the studies found.')+streakText(streak());document.getElementById('rv').open=true;
fetch('/api/guess',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({entry:E,choice:i})}).catch(()=>{})});
const S=document.getElementById('shift');document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-s]').forEach(x=>x.disabled=true);document.getElementById('sr').textContent='Thanks. Counted anonymously.';
fetch('/api/shift',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({entry:E,shift:b.dataset.s},S.dataset.variant?{variant:+S.dataset.variant}:{}))}).catch(()=>{})});`;
  return layout(e.belief + " · Unlearn", body, { script: STREAK_JS + js + (connections.length ? FOLLOW_JS : "") + (e.change ? STORE_JS + KIT_JS : ""), path: "/e/" + e.id, desc: "Belief: " + e.belief + " " + DIRECTION[e.direction].name + " (" + STRENGTH[st].name.toLowerCase() + " evidence)." });
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
$('verdict').textContent=(i===x.a?'Right. ':'Not quite. ')+x.d+' ('+x.st.toLowerCase()+' evidence).';$('says').textContent=x.s;$('more').href='/e/'+x.id;$('res').hidden=false;$('score').textContent=right+' of '+seen+' right';if(seen===1)$('verdict').textContent+=streakText(streak());
fetch('/api/guess',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({entry:x.id,choice:i})}).catch(()=>{})}
$('next').onclick=()=>{k++;show();$('bel').focus()};show();`;
  return layout("Test your intuition · Unlearn", `<div class="play"><h1>Test your intuition</h1><p class="lede">One belief at a time. Make a guess, then see what the evidence found. <span id="score" class="tag">0 of 0 right</span></p>
<div class="step"><span class="tag" id="cat"></span><blockquote class="b" id="bel" tabindex="-1"></blockquote><p style="margin:0"><b id="q"></b></p><div class="opts" id="opts"></div>
<div id="res" hidden aria-live="polite"><p><b id="verdict"></b></p><p id="says"></p><div class="row"><a class="btn" id="more" href="/">Read the full entry</a><button class="btn primary" id="next" type="button">Next belief</button></div></div></div>
<noscript><p>Play mode needs script. <a href="/topics">Browse every entry instead</a>.</p></noscript></div>`, { script: STREAK_JS + js, path: "/play" });
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
<li><b>Finding new beliefs.</b> Every six hours it searches Europe PMC for new reviews about myths, misconceptions and famous findings retold, and walks the older literature a page at a time. It drafts a candidate belief from the abstract alone (again with a quote that must be in it, and no numbers or names the abstract lacks), and shows it in the <a href="/lab">Lab</a>. A draft gets its own page when readers vote it up, or by itself 48 hours after it was found if nobody has voted it down. It stays labelled a draft from one paper and is never merged into a graded entry by itself.</li>
<li><b>Better explanations.</b> When an entry changes few minds, the model re-words "Where the intuition slips" from the entry's own text, with no new facts. Half the readers see the new wording; the "did this change how you see it" taps decide. The new wording wins only on a clear difference (two-proportion test, at least ${LAB.variant_min_arm} answers each); otherwise the original stays.</li></ol>
${metrics.lab ? `<div class="stats"><div><b>${metrics.lab.reviews_classified}</b><span class="small muted">new reviews read and labelled</span></div><div><b>${metrics.lab.entries_reinforced}</b><span class="small muted">entries reinforced</span></div><div><b>${metrics.lab.entries_challenged}</b><span class="small muted">entries under review</span></div><div><b>${metrics.lab.candidates.drafted || 0}</b><span class="small muted">candidate beliefs in the Lab</span></div></div>` : ""}
<h2>Why "Unlearn"</h2><p>The name comes from a line in Rutger Bregman's <i>Humankind</i>, chapter "Homo Ludens": coaches at the Agora school "have to unlearn much of their training as teachers." The same applies to all of us. Unlearn also keeps its original tool for the adults around curious children: <a href="/coach">coach a child's curiosity</a>.</p>
<h2>Something new every day</h2><p>Each day has a <a href="/today">myth of the day</a>, in a fixed order that goes through every entry before any repeats, and it is in the <a href="/feed.xml">feed</a> with the Lab drafts as they publish. Discovery also searches for replications and re-analyses of famous studies, the "famous finding, retold" kind, and drafts them for the Lab with a then-and-now timeline.</p>
<h2>From believing to doing</h2><p>Unlearning a belief is half the job. The <a href="/change">change layer</a> holds practices where the evidence says the common way of trying to change is not the one that works, graded like every entry, each with a small trial: a tiny first step, an if-then plan (picked from suggestions or written yourself), a dot a day, reflections on days ${CHANGE.review_days.join(", ")} that name what got in the way and suggest an adjustment, and an optional reminder or message to a friend. Suggested plans are re-ordered by how often readers who picked them chose to keep going. Daily discovery also searches for reviews of things people can do themselves and drafts candidate practices for the Lab. Claims that did not replicate, like power posing and ego depletion, are listed as oversold and never get a trial.</p>
${metrics.change && metrics.change.trials_started ? `<div class="stats"><div><b>${metrics.change.trials_started}</b><span class="small muted">trials started</span></div><div><b>${metrics.change.keep_share === null ? "n/a" : Math.round(metrics.change.keep_share * 100) + "%"}</b><span class="small muted">of finished trials kept going</span></div></div>` : ""}
<h2>What it keeps</h2><p>No accounts and no cookies. Your trials, check-ins and reflections live only in your browser's storage; the server counts only that a trial started, a day was checked in, or a trial was kept or stopped, per practice, with nothing that identifies you. A guess or a "did this change your view" tap is counted per entry with nothing that identifies the reader. Your daily streak is kept only in your own browser's storage and is never sent anywhere.</p>`, { path: "/how" });
}

export function sitemap(drafts = []) {
  const urls = ["/", "/topics", "/change", "/plan", "/play", "/lab", "/graph", "/how", "/coach", ...drafts.map(id => "/d/" + id), ...CATEGORIES.map(c => "/topics/" + c.id), ...ENTRIES.map(e => "/e/" + e.id)];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>https://unlearn.ultrastable.org${u}</loc></url>`).join("")}</urlset>`;
}

export function entryJson(e, dois = {}) {
  return { id: e.id, url: "https://unlearn.ultrastable.org/e/" + e.id, category: e.cat, belief: e.belief, strength: e.strength, direction: e.direction,
    why_it_feels_true: e.feels, guess: e.guess, evidence: e.says, where_it_slips: e.slip, instead: e.instead, still_holds: e.holds,
    sources: e.sources.map((s, i) => ({ ...s, doi: dois[i] || null })), watch_query: e.query, related: e.related || [] };
}

export function labPage({ candidates = [], trials = [], metrics = {} } = {}) {
  const items = candidates.map(c => `<div class="step" data-c="${c.id}"><div class="k">Candidate belief</div><blockquote class="b" style="--h:300">${esc(c.draft.belief)}</blockquote>${c.draft.practice ? `<p class="small"><span class="tag">Candidate practice</span> <b>${esc(c.draft.practice)}</b></p>` : ""}
${c.draft.story ? `<ol class="timeline"><li><span class="k">The famous story</span>${esc(c.draft.story)}</li><li><span class="k">What this paper found</span>${esc(c.draft.later)}</li></ol>` : `<p style="margin:0">${esc(c.draft.says)}</p>`}<blockquote class="q">${esc(c.draft.quote)}</blockquote>${c.published ? `<p class="small"><a href="/d/${c.id}">Readers voted this up: it has its own page</a></p>` : ""}
<p class="small"><a href="${esc(c.url)}">${esc(c.title)}</a> <span class="muted">${esc(c.venue)}${c.year ? ", " + c.year : ""}</span></p>
<div class="row"><span class="small muted">Should this become a full entry?</span><button class="btn" data-v="yes">Yes</button><button class="btn" data-v="no">No</button><span class="small muted" aria-live="polite">${c.yes + c.no ? `${c.yes} yes, ${c.no} no` : ""}</span></div></div>`).join("");
  const tr = trials.length ? `<h2>Wording trials</h2><p class="muted small">Where a re-worded explanation is being tested against the original on "did this change how you see it".</p>${trials.map(t => `<div class="src"><a href="/e/${esc(t.entry)}">${esc((byId[t.entry] || {}).belief || t.entry)}</a> <span class="tag">${esc(t.arm === "control" ? "original" : "new wording")}</span> <span class="tag">${esc(t.status)}</span> <span class="small muted">${t.yes} of ${t.total} shifted</span><br><span class="small">${esc(t.text)}</span></div>`).join("")}` : "";
  const js = `document.querySelectorAll('[data-c]').forEach(d=>d.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{d.querySelectorAll('[data-v]').forEach(x=>x.disabled=true);b.setAttribute('aria-pressed','true');d.querySelector('[aria-live]').textContent='Thanks. Counted anonymously.';
fetch('/api/candidate-vote',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:+d.dataset.c,vote:b.dataset.v})}).catch(()=>{})}));`;
  return layout("Lab · Unlearn", `<h1>The Lab</h1><p class="lede">Beliefs the loop found in new research reviews and has not written up yet. Each draft comes from one review's abstract, with a sentence quoted from it. These are drafts, not entries: they have not been graded.</p>
<div class="stats"><div><b>${(metrics.candidates && metrics.candidates.drafted) || 0}</b><span class="small muted">drafts open</span></div><div><b>${metrics.reviews_classified || 0}</b><span class="small muted">new reviews labelled</span></div><div><b>${(metrics.wording_trials && metrics.wording_trials.winner) || 0}</b><span class="small muted">better wordings kept</span></div></div>
${items || `<p class="muted">No drafts yet. The loop searches once a day; drafts appear here as it finds reviews that test a popular belief.</p>`}${tr}
<p class="small"><a href="/how">How the loops work</a> · <a href="/api/candidates.json">/api/candidates.json</a></p>`, { script: js, path: "/lab", desc: "Candidate beliefs Unlearn's loop found in new research reviews, published by themselves after 48 hours unless readers vote them down." });
}

export const draftCard = c => `<a class="card" href="/d/${c.id}" style="--h:95"><span class="tag">${c.draft.practice ? "Lab practice: " + esc(c.draft.practice) : "Lab draft"}</span><span class="belief">${esc(c.draft.belief)}</span><span class="small muted">From one paper, not yet graded</span></a>`;
export function draftPage(c) {
  const d = c.draft;
  const body = `<p class="small"><a href="/lab">Lab</a></p><div class="step warnbox"><div class="k">Draft from one paper</div><p style="margin:0">The loop wrote this from one paper's abstract; it was published because readers voted it up or because nobody voted it down within 48 hours. It has not been graded like the encyclopedia's entries: the quoted sentence below is from the abstract, and the citation comes from the research index, not from the model.</p></div>
<p class="small muted" style="margin:0">The belief</p><blockquote class="b" style="--h:95">${esc(d.belief)}</blockquote>${d.practice ? `<p><span class="tag">What the paper found helps</span> <b>${esc(d.practice)}</b></p>` : ""}
${d.story ? `<ol class="timeline"><li><span class="k">The famous story</span>${esc(d.story)}</li><li><span class="k">What this paper found</span>${esc(d.later)}</li></ol>` : `<div class="step"><div class="k">What this paper found</div><p style="margin:0">${esc(d.says)}</p></div>`}
<div class="step"><div class="k">In the paper's own words</div><blockquote class="q">${esc(d.quote)}</blockquote><p class="small"><a href="${esc(c.url)}">${esc(c.title)}</a> <span class="muted">${esc(c.venue)}${c.year ? ", " + c.year : ""}</span></p></div>
<p class="small muted">${c.yes} readers said this should become a full entry, ${c.no} said no.</p><p><a class="btn" href="/lab">More in the Lab</a> <a class="btn" href="/today">Myth of the day</a></p>`;
  return layout(d.belief + " · Lab draft · Unlearn", body, { path: "/d/" + c.id, desc: "Lab draft from one paper: " + d.belief });
}

// Atom feed: the myth of the day for the last 30 days, and Lab drafts as they publish. Ids are stable, so readers see each item once.
const xesc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
// Items shared by the Atom feed and the JSON Feed (STICKY-1 reads the JSON one): one list, two formats, so they never disagree.
export function feedItems(now, drafts = [], pick = null) {
  const base = "https://unlearn.ultrastable.org", day = Math.floor(now / 86400000);
  const items = [];
  for (let k = 0; k < 30; k++) {
    const t = (day - k) * 86400000, e = (pick || mythOfDay)(t);
    if (!e) continue;
    items.push({ id: `${base}/today/${new Date(t).toISOString().slice(0, 10)}`, url: `${base}/e/${e.id}`, at: new Date(t).toISOString(), title: "Myth of the day: " + e.belief, text: e.says, tags: [e.cat].filter(Boolean), kind: "myth-of-the-day", depth: (e.sources || []).length });
  }
  for (const c of drafts) items.push({ id: `${base}/d/${c.id}`, url: `${base}/d/${c.id}`, at: new Date(c.found).toISOString(), title: "Lab draft: " + c.draft.belief, text: (c.draft.later || c.draft.says) + " (Draft from one paper, not yet graded.)", tags: ["lab", c.kind || "myth"], kind: "lab-draft", depth: 1 });
  items.sort((a, b) => b.at.localeCompare(a.at));
  return items;
}
export function feed(now, drafts = [], pick = null) {
  const base = "https://unlearn.ultrastable.org", items = feedItems(now, drafts, pick);
  return `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Unlearn: myth of the day</title><link href="${base}/"/><link rel="self" href="${base}/feed.xml"/><id>${base}/feed.xml</id><updated>${items.length ? items[0].at : new Date(now).toISOString()}</updated>
${items.map(i => `<entry><title>${xesc(i.title)}</title><link href="${xesc(i.url)}"/><id>${xesc(i.id)}</id><updated>${i.at}</updated><summary>${xesc(i.text)}</summary></entry>`).join("\n")}</feed>`;
}
// JSON Feed 1.1: the content feed the platform's stickiness step reads (instances/ultrastable/progress.json `stickiness.content_feed`).
export function jsonFeed(now, drafts = [], pick = null) {
  const base = "https://unlearn.ultrastable.org";
  return { version: "https://jsonfeed.org/version/1.1", title: "Unlearn: myth of the day", home_page_url: base + "/", feed_url: base + "/feed.json",
    description: "Popular beliefs set against the evidence: a myth of the day and Lab drafts as the loop publishes them. Runs on Ultrastable.",
    items: feedItems(now, drafts, pick).map(i => ({ id: i.id, url: i.url, title: i.title, content_text: i.text, date_published: i.at, tags: i.tags, _kind: i.kind, _depth: i.depth })) };
}
// A small mark for browser tabs; every browser asks for /favicon.ico, so serving it stops a 404 on each first visit.
export const FAVICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1f2937"/><text x="32" y="44" text-anchor="middle" font-family="system-ui,sans-serif" font-size="34" font-weight="800" fill="#fbbf24">U</text></svg>';

export function notFound() {
  return layout("Not found · Unlearn", `<h1>Nothing here</h1><p class="lede">That page does not exist. Try a topic, or search.</p><form class="pill" action="/search" role="search"><input name="q" aria-label="Search beliefs"><button class="btn primary" type="submit">Search</button></form><p><a class="btn" href="/topics">Browse topics</a></p>`);
}

// ---- the change layer (UNLEARN-CHANGE-1): kits on practice pages, /change and /plan. Personal data stays in this browser. ------------------
const STORE_JS = `const PK='unlearn-plans';function plans(){try{return JSON.parse(localStorage.getItem(PK)||'[]')}catch(e){return[]}}
function savePlans(p){try{localStorage.setItem(PK,JSON.stringify(p));return true}catch(e){return false}}
function today(){return Math.floor(Date.now()/864e5)}const h=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function ev(entry,event,plan){fetch('/api/plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({entry:entry,event:event,plan:plan})}).catch(()=>{})}
function cal(p){const d=new Date(today()*864e5).toISOString().slice(0,10).replace(/-/g,''),c=s=>String(s).replace(/[\\\;,]/g,m=>'\\\\'+m);
const t=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Unlearn//Plan//EN','BEGIN:VEVENT','UID:'+d+'-'+p.entry+'@unlearn.ultrastable.org','DTSTAMP:'+d+'T000000Z','DTSTART;VALUE=DATE:'+d,'RRULE:FREQ=DAILY;COUNT='+p.days,'SUMMARY:'+c(p.name),'DESCRIPTION:'+c('When '+p.when+', '+p.then+'. Check in at https://unlearn.ultrastable.org/plan'),'END:VEVENT','END:VCALENDAR'].join('\\r\\n');
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/calendar'}));a.download='unlearn-plan.ics';document.body.appendChild(a);a.click();a.remove()}
function tell(p,out){const t='My plan for the next '+p.days+' days: when '+p.when+', I will '+p.then+'. Will you ask me how it went in a week?';
if(navigator.share)navigator.share({text:t}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>{if(out)out.textContent='Copied. Paste it to someone you trust.'}).catch(()=>{})}`;

export function kit(e, counts = {}) {
  if (!e.change) return "";
  const k = e.change, ranked = rankPlans(k, counts);
  const started = Object.entries(counts).filter(([x]) => x.startsWith("plan:start")).reduce((n, [, v]) => n + v, 0);
  const kept = Object.entries(counts).filter(([x]) => x.startsWith("plan:keep")).reduce((n, [, v]) => n + v, 0);
  return `<section class="step kit" id="kit" data-entry="${esc(e.id)}" data-name="${esc(k.name)}" data-days="${k.days}"><div class="k">Put it to work: try it for ${k.days} days</div>
<p style="margin:0 0 8px"><b>Start tiny.</b> ${esc(k.tiny)}</p>
<p class="small muted">Decide exactly when you will do it. People who plan when and where follow through more often than people who only intend to (<a href="/e/if-then-plans">the evidence</a>).</p>
<fieldset class="plans"><legend class="small"><b>Pick a plan</b>${started >= CHANGE.min_shown ? ` <span class="muted">(ordered by how often readers kept going with it)</span>` : ""}</legend>
${ranked.map((p, n) => `<label class="opt"><input type="radio" name="pl" value="${p.i}" data-w="${esc(p.when)}" data-t="${esc(p.then)}"${n === 0 ? " checked" : ""}> <span>When ${esc(p.when)}, ${esc(p.then)}.</span></label>`).join("")}
<label class="opt"><input type="radio" name="pl" value="own"> <span>Write my own</span></label>
<div id="own" hidden><label class="small">When <input id="ow" maxlength="120" placeholder="a moment that happens every day"></label><label class="small">I will <input id="ot" maxlength="120" placeholder="one small action"></label></div></fieldset>
<div class="row"><button class="btn primary" id="go" type="button">Start my ${k.days}-day trial</button><a class="btn" href="/plan">My plans</a></div>
<p class="small muted" id="ks" aria-live="polite">Saved only in this browser. Nothing about you is sent; we count only that a trial started.${started >= CHANGE.min_shown ? ` ${started} readers started this; ${kept} chose to keep going.` : ""}</p>
<div id="after" class="row" hidden><a class="btn primary" href="/plan">Check in</a><button class="btn" id="cal" type="button">Add a daily reminder</button><button class="btn" id="tell" type="button">Tell someone</button></div>
<noscript><p class="small">The trial needs script; the plan above works on paper too.</p></noscript></section>`;
}
const KIT_JS = `(function(){const K=document.getElementById('kit');if(!K)return;const E=K.dataset.entry,$=id=>document.getElementById(id);
K.querySelectorAll('input[name=pl]').forEach(r=>r.onchange=()=>{$('own').hidden=r.value!=='own'||!r.checked});
function cur(){return plans().find(p=>p.entry===E&&p.status==='active')}
function done(p){$('after').hidden=false;$('go').hidden=true;$('ks').textContent='Day '+(today()-p.start+1)+' of '+p.days+': when '+p.when+', '+p.then+'. Saved only in this browser.'}
const c=cur();if(c)done(c);
$('go').onclick=()=>{const r=K.querySelector('input[name=pl]:checked');if(!r)return;let when,then,pl;
if(r.value==='own'){when=$('ow').value.trim();then=$('ot').value.trim();pl='own';if(!when||!then){$('ks').textContent='Fill in both parts: when, and what you will do.';return}}
else{when=r.dataset.w;then=r.dataset.t;pl=+r.value}
const p={entry:E,name:K.dataset.name,when:when,then:then,plan:pl,start:today(),days:+K.dataset.days,marks:{},reviews:{},status:'active'};
const all=plans().filter(x=>!(x.entry===E&&x.status==='active'));all.push(p);if(!savePlans(all)){$('ks').textContent='This browser is not letting the page save. Write the plan down instead: when '+when+', '+then+'.';return}
ev(E,'start',pl);done(p)};
$('cal').onclick=()=>{const p=cur();if(p)cal(p)};$('tell').onclick=()=>{const p=cur();if(p)tell(p,$('ks'))}})();`;

export function changePage({ stats = {}, grades = {} } = {}) {
  const cats = CATEGORIES.filter(c => c.kind === "change");
  const myths = ENTRIES.filter(e => e.change && !cats.some(c => c.id === e.cat));
  const nPractices = ENTRIES.filter(e => e.change).length;
  const started = Object.values(stats).reduce((n, s) => n + s.started, 0), kept = Object.values(stats).reduce((n, s) => n + s.kept, 0);
  return layout("Change what you do · Unlearn", `<section class="hero"><h1>Change what you do, not only what you believe.</h1>
<p class="lede">${nPractices} practices where the evidence says the usual way of trying to change is not the one that works. Each is graded like every other entry. Each comes with a small trial you can start in a minute: pick an if-then plan, check in each day, and reflect at spaced intervals. It all stays in your browser.</p>
<div class="row" style="margin-bottom:18px"><a class="btn primary" href="/plan">My plans</a><a class="btn" href="/e/if-then-plans">Start with if-then plans</a></div>
${started >= CHANGE.min_shown ? `<div class="stats"><div><b>${started}</b><span class="small muted">trials started</span></div><div><b>${kept}</b><span class="small muted">kept going after the trial</span></div></div>` : ""}</section>
${cats.map(c => `<h2 id="${c.id}"><a href="/topics/${c.id}">${esc(c.name)}</a></h2><p class="muted">${esc(c.blurb)}</p><div class="grid">${ENTRIES.filter(e => e.cat === c.id).map(e => card(e, grades)).join("")}</div>`).join("")}
${myths.length ? `<h2>From the myths</h2><p class="muted">Myth entries whose "what works instead" you can try.</p><div class="grid">${myths.map(e => card(e, grades)).join("")}</div>` : ""}
<h2>Oversold: do not build a plan on these</h2><p class="muted">Popular self-improvement claims whose evidence did not hold up. They are here so you can spend your effort elsewhere.</p>
<div class="grid">${OVERSOLD.filter(o => byId[o.id]).map(o => `<a class="card" href="/e/${esc(o.id)}" style="--h:12"><span class="tag">Oversold</span><span class="belief">${esc(byId[o.id].belief)}</span><span class="small">${esc(o.why)}</span></a>`).join("")}</div>
<h2>How the trials work</h2><ol><li><b>A tiny first step and an if-then plan.</b> Deciding when and where you will act roughly doubles the follow-through of a good intention in many studies (<a href="/e/if-then-plans">evidence</a>).</li>
<li><b>A dot a day.</b> Tracking the action, not the outcome, helps people reach goals (<a href="/e/monitor-progress">evidence</a>).</li>
<li><b>Reflections spaced further apart</b> on days ${CHANGE.review_days.join(", ")}: name what got in the way and adjust the plan.</li>
<li><b>No penalty for a missed day.</b> Habits take about two months and a single miss does not reset them (<a href="/e/habit-timeline">evidence</a>). Keeping going extends the trial to ${CHANGE.habit_days} days.</li>
<li><b>Optional commitment.</b> Tell one person, or add a daily reminder to your calendar; both are made on your device (<a href="/e/commitment-devices">evidence</a>).</li></ol>`, { path: "/change", desc: "Evidence-graded practices that go against common advice, each with a small private trial you can start in a minute." });
}

export function planPage() {
  const K = Object.fromEntries(ENTRIES.filter(e => e.change).map(e => [e.id, { name: e.change.name, days: e.change.days }]));
  const js = `const K=${JSON.stringify(K).replace(/</g, "\\u003c")},RV=${JSON.stringify(CHANGE.review_days)},HD=${CHANGE.habit_days},RS=${JSON.stringify(REASONS.map(r => ({ id: r.id, label: r.label, tip: r.tip }))).replace(/</g, "\\u003c")};
const L=document.getElementById('list');
function save(p,i){const all=plans();all[i]=p;savePlans(all);draw()}
function card(p,i){const d=today()-p.start+1,n=Math.min(d,p.days);let dots='';for(let k=Math.max(0,n-21);k<n;k++){const m=p.marks[p.start+k];dots+='<i class="'+(m||'')+'" title="Day '+(k+1)+'"></i>'}
const did=Object.values(p.marks).filter(m=>m==='y'||m==='p').length,t=p.marks[today()];
let x='<div class="step" data-i="'+i+'"><div class="k">'+h(p.name)+' · day '+Math.min(d,p.days)+' of '+p.days+'</div><p style="margin:0 0 6px"><b>When '+h(p.when)+', '+h(p.then)+'.</b></p><div class="dots" aria-label="'+did+' of '+n+' days done">'+dots+'</div>';
if(d>p.days){x+='<p><b>Your '+p.days+' days are up.</b> You did it on '+did+' of them. What next?</p><div class="row"><button class="btn primary" data-a="keep">Keep going</button><button class="btn" data-a="edit">Change the plan</button><button class="btn" data-a="stop">Stop here</button></div>'}
else{if(!t)x+='<div class="row"><span class="small muted">Today:</span><button class="btn primary" data-m="y">Did it</button><button class="btn" data-m="p">Partly</button><button class="btn" data-m="n">Not today</button></div>';else x+='<p class="small muted">Checked in today. See you tomorrow.</p>';
if(d>1&&!p.marks[today()-1])x+='<p class="small muted">Missed a day? That does not undo a habit. Pick up at the next cue.</p>';
const r=RV.find(v=>v<=d&&v<=p.days&&!p.reviews[v]);if(r)x+='<div class="step okbox"><div class="k">Day '+r+' reflection</div><p style="margin:0 0 6px">What has helped or got in the way most?</p><div class="row">'+RS.map(s=>'<button class="btn" data-r="'+s.id+'" data-v="'+r+'">'+h(s.label)+'</button>').join('')+'</div><p class="small" data-tip aria-live="polite"></p></div>'}
x+='<div class="row small"><a href="/e/'+h(p.entry)+'">Why this works</a><button class="btn" data-a="edit">Edit plan</button><button class="btn" data-a="cal">Reminder</button><button class="btn" data-a="tell">Tell someone</button></div><div data-ed hidden><label class="small">When <input data-w maxlength="120" value="'+h(p.when)+'"></label><label class="small">I will <input data-t maxlength="120" value="'+h(p.then)+'"></label><button class="btn primary" data-a="saveed">Save and restart</button></div></div>';return x}
function draw(){const all=plans(),act=all.map((p,i)=>[p,i]).filter(([p])=>p.status==='active'),old=all.map((p,i)=>[p,i]).filter(([p])=>p.status!=='active');
L.innerHTML=act.length?act.map(([p,i])=>card(p,i)).join(''):'<p class="muted">No trials yet. <a href="/change">Pick a practice</a> and start one in a minute.</p>';
document.getElementById('old').innerHTML=old.length?'<h2>Finished or stopped</h2>'+old.map(([p,i])=>'<div class="src">'+h(p.name)+': when '+h(p.when)+', '+h(p.then)+'. <span class="small muted">'+Object.values(p.marks).filter(m=>m!=='n').length+' days done.</span> <button class="btn" data-del="'+i+'">Remove</button></div>').join(''):'';
L.querySelectorAll('[data-i]').forEach(el=>{const i=+el.dataset.i,p=plans()[i];
el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{p.marks[today()]=b.dataset.m;ev(p.entry,{y:'done',p:'partly',n:'miss'}[b.dataset.m]);save(p,i)});
el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{p.reviews[b.dataset.v]=b.dataset.r;ev(p.entry,'r:'+b.dataset.r);const s=RS.find(z=>z.id===b.dataset.r);const all=plans();all[i]=p;savePlans(all);el.querySelector('[data-tip]').textContent=s.tip;el.querySelectorAll('[data-r]').forEach(z=>z.disabled=true)});
el.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;
if(a==='keep'){ev(p.entry,'keep',p.plan);p.days=p.days<HD?HD:p.days+30;save(p,i)}else if(a==='stop'){ev(p.entry,'stop',p.plan);p.status='stopped';save(p,i)}
else if(a==='edit'){el.querySelector('[data-ed]').hidden=false}else if(a==='cal')cal(p);else if(a==='tell')tell(p,null);
else if(a==='saveed'){const w=el.querySelector('[data-w]').value.trim(),t=el.querySelector('[data-t]').value.trim();if(!w||!t)return;ev(p.entry,'change');Object.assign(p,{when:w,then:t,plan:'own',start:today(),marks:{},reviews:{},days:(K[p.entry]||{}).days||p.days});save(p,i)}})});
document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const all=plans();all.splice(+b.dataset.del,1);savePlans(all);draw()})}
document.getElementById('wipe').onclick=()=>{savePlans([]);draw()};draw();`;
  return layout("My plans · Unlearn", `<h1>My plans</h1><p class="lede">Your trials, kept only in this browser. Check in once a day; every few days you get a short reflection to adjust the plan.</p>
<div id="list"><noscript><p>Plans need script, because they live only on your device.</p></noscript></div><div id="old"></div>
<p class="small muted">Nothing on this page is sent anywhere except anonymous counts (a trial started, a day checked in) per practice, with nothing that identifies you. <button class="btn" id="wipe" type="button">Delete everything on this device</button></p>
<p><a class="btn" href="/change">More practices</a></p>`, { script: STORE_JS + js, path: "/plan", desc: "Your private trials of evidence-backed practices: daily check-ins and spaced reflections, kept on your device." });
}

// KGRAPH-1: the encyclopedia's knowledge graph, read live on every load (worker/graph.js). Nothing on this page is typed by hand.
const KIND_NAME = { link: "Possible connection", gap: "Gap", bridge: "Bridge" };
const nodeHref = (id, label) => (id.startsWith("entry:") ? `<a href="/e/${esc(id.slice(6))}">${esc(label)}</a>` : esc(label));
export function graphPage(v) {
  const a = v.analysis, h = v.practices.health, L = id => (v.labels[id] || { label: id.replace(/^[a-z]+:/, ""), kind: id.split(":")[0] });
  const insight = i => `<div class="step"><div class="k">${esc(KIND_NAME[i.kind] || i.kind)}${i.status === "kept" ? ' <span class="tag ok">came true</span>' : ""}</div><p style="margin:0">${esc(i.text)}</p>${i.kind === "link" ? `<p class="small" style="margin:.3em 0 0">${["subject", "object"].map(k => i[k] && i[k].startsWith("entry:") ? `<a data-ins="${esc(i.id)}" href="/e/${esc(i[k].slice(6))}?via=graph">${esc(byId[i[k].slice(6)] ? byId[i[k].slice(6)].belief : i[k])}</a>` : "").filter(Boolean).join(" · ")}</p>` : ""}</div>`;
  const body = `<h1>The knowledge graph</h1>
<p>Every entry, study, researcher, journal, new review and Lab draft on Unlearn is a node in one graph. The hourly loop rebuilds it from the data, looks for what nobody wrote down, and checks later whether each finding came true. Kinds of finding that come true are trusted more next time.</p>
<div class="row"><span class="tag">${esc(h.nodes)} nodes</span><span class="tag">${esc(h.edges)} links</span><span class="tag">${esc(h.communities)} clusters</span>${a ? `<span class="tag">modularity ${esc(a.modularity)}</span>` : ""}<span class="tag ${h.ok ? "ok" : "warn"}">${h.last_run_hours_ago === null ? "not built yet" : `rebuilt ${esc(Math.round(h.last_run_hours_ago * 60))} min ago`}</span>${h.kept_rate === null ? "" : `<span class="tag">${esc(Math.round(h.kept_rate * 100))}% of checked findings came true</span>`}</div>
${a && a.hubs && a.hubs.length ? `<h2>At the centre</h2><p class="small muted">The nodes the rest of the graph leans on most (PageRank).</p><p>${a.hubs.map(id => nodeHref(id, L(id).label) + ` <span class="small muted">(${esc(L(id).kind)})</span>`).join(" · ")}</p>` : ""}
${a && a.bridges && a.bridges.length ? `<h2>Bridges</h2><p class="small muted">Research that connects clusters which otherwise do not touch.</p><p>${a.bridges.slice(0, 12).map(id => nodeHref(id, L(id).label) + ` <span class="small muted">(${esc(L(id).kind)})</span>`).join(" · ")}</p>` : ""}
<h2>Open findings</h2>${v.open.length ? v.open.map(insight).join("") : '<p class="muted">None open right now.</p>'}
${v.kept.length ? `<h2>Findings that came true</h2>${v.kept.map(insight).join("")}` : ""}
<h2>How this graph is built, checked right now</h2>${v.method}
<p class="small">Data: <a href="/api/graph.json">/api/graph.json</a> · <a href="/api/graph/insights">/api/graph/insights</a> · <a href="/api/graph/method">/api/graph/method</a> · <a href="/api/graph/health">/api/graph/health</a></p>`;
  return layout("The knowledge graph · Unlearn", body, { script: FOLLOW_JS, path: "/graph", desc: "Unlearn's knowledge graph of beliefs, studies and researchers, rebuilt hourly, with the connections it found and whether they came true." });
}
// A click on a suggested connection is the reader's verdict on it: counted anonymously, by finding id only.
export const FOLLOW_JS = `document.querySelectorAll('[data-ins]').forEach(a=>a.addEventListener('click',()=>{try{navigator.sendBeacon('/api/graph/follow',new Blob([JSON.stringify({id:a.dataset.ins})],{type:'application/json'}))}catch(e){}}));`;
export function connectionsHtml(list) {
  if (!list.length) return "";
  return `<h2>Connected by shared research</h2><p class="small muted">Found by the knowledge graph, not written by an editor: these beliefs rest on some of the same studies or researchers. <a href="/graph">How</a></p><div class="grid">${list.map(c => `<a class="card" data-ins="${esc(c.id)}" href="/e/${esc(c.entry.id)}?via=graph" style="--h:${(CATEGORIES.find(x => x.id === c.entry.cat) || { hue: 200 }).hue}"><span class="belief">${esc(c.entry.belief)}</span><span class="small muted">${esc((m => (m ? "Both draw on research by " + m[1] + "." : c.why))(/\(([^()]*)\)\.?$/.exec(c.why)))}</span></a>`).join("")}</div>`;
}
