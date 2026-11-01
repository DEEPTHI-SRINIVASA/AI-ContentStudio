const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let S;try{S=JSON.parse(localStorage.getItem("cs6"))}catch(e){}
S=S||{items:[],brand:{name:"",tone:"Friendly",aud:"",vocab:"",avoid:""},log:[],prompts:[],exp:0};
const save=()=>{try{localStorage.setItem("cs6",JSON.stringify(S))}catch(e){}};
const log=m=>{S.log.unshift({t:Date.now(),m});S.log=S.log.slice(0,30);save()};
function toast(m){const t=$("#toast");t.textContent=m;t.style.display="block";clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display="none",1500)}
const fmt=t=>new Date(t).toLocaleString([], {dateStyle:"medium",timeStyle:"short"});
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const AUD=["Gen Z","Working professionals","Parents","Founders"],GOAL=["Get followers","Sell a product","Get signups","Go viral"];
const CTA={"Get followers":"Follow for more.","Sell a product":"Tap the link to order today.","Get signups":"Sign up free, link in bio.","Go viral":"Share this with someone who needs it."};
const PL={"Instagram caption":2200,"LinkedIn post":3000,"Twitter / X post":280,"YouTube title":100,"YouTube description":5000,"Blog outline":9999,"Reel script":600,"Ad copy":300,"Email":2000,"Product description":800,"Hashtags":200};
const EX=["Launching a streetwear brand for college students","Opening a home bakery in Bengaluru","Free course on learning Excel"];
const TPL={"Instagram":["You write punchy Instagram captions.","Write a caption about: [topic]. Audience: Gen Z. Tone: friendly. Include 3 hashtags and a call to action."],
"LinkedIn":["You are a B2B thought-leadership writer.","Write a LinkedIn post about: [topic]. Audience: founders. Use a story format and end with a question."],
"Blog":["You are an SEO blog writer.","Write a blog outline about: [topic]. Audience: beginners. Use a bullet list of sections and keep it concise."],
"YouTube":["You write high-retention YouTube copy.","Write a title and description about: [topic]. Audience: students. Include a call to action."],
"Advertisement":["You are a direct-response copywriter.","Write ad copy about: [topic]. Audience: parents. Short, bold, with a call to action and an emoji."],
"Email":["You write friendly marketing emails.","Write an email about: [topic]. Audience: customers. Use a question hook and a sign up call to action."]};
/* ---------- demo generation engine (rule-based) ---------- */
function hook(idea,v,h){const a=h?["Yeh jaanna zaroori hai:","Ruko! Yeh dekho:","Scene yeh hai, bhai:"]:["Here is what nobody tells you about","Stop scrolling. This changes","Plot twist: we just started"];return a[v]+" "+idea.toLowerCase().replace(/\.$/,"")+"."}
function build(p,v,o){
 const idea=o.idea.trim()||EX[0],hing=o.lang==="Hinglish",H=hook(idea,v,hing),B=S.brand,useB=o.brand&&B.name;
 let C=CTA[o.goal];if(hing)C=C.replace("Follow for more.","Follow karo aur updates paao.").replace("Share this with someone who needs it.","Apne dost ko bhejo.");
 const em=v===1?" 🔥":v===2?" 😄":"",a=o.aud.toLowerCase(),tone=useB?B.tone:o.tone;
 const tags="#"+idea.split(/\s+/).filter(w=>w.length>4).slice(0,2).map(w=>w.replace(/\W/g,"")).join(" #")+" #"+o.aud.replace(/\s/g,"")+" #trending";
 const by={"Instagram caption":`${H}${em}\n\nMade for ${a}. Tone: ${tone.toLowerCase()}.\n${C}\n\n${tags}`,
 "LinkedIn post":`${H}\n\nA short story for ${a}:\n- The problem we noticed\n- What we built\n- What we learned\n\n${C}`,
 "Twitter / X post":`${H} ${C}${em}`.slice(0,280),
 "YouTube title":["How I started: "+idea,"I tried this so you do not have to: "+idea,"Nobody warned me about "+idea][v].slice(0,100),
 "YouTube description":`In this video: ${idea}.\n\n0:00 Intro\n1:00 The plan\n3:00 Results\n\n${C}\n${tags}`,
 "Blog outline":`Title: ${idea}\n1. Why it matters to ${a}\n2. The story behind it\n3. Three key lessons\n4. Common mistakes\n5. Next steps\nCTA: ${C}`,
 "Reel script":`Hook (0-3s): ${H}\nScene 1: Show the problem.\nScene 2: Show the idea in action.\nScene 3: Result.\nEnd text: ${C}`,
 "Ad copy":`${H}${em}\nBuilt for ${a}. ${C}`,
 "Email":`Subject: ${cap(idea)}\n\nHi there,\n\n${H}\n\nWe made this for ${a}, in a ${tone.toLowerCase()} way.\n\n${C}\n\nThanks,\n${useB?B.name:"The team"}`,
 "Product description":`${cap(idea)}. Designed for ${a}. Simple, reliable and made with care.${em}\n${C}`,
 "Hashtags":tags+" #"+(v?["bold","funny"][v-1]:"safe")};
 let t=by[p];
 if(useB&&B.vocab&&!/^Hashtags|title/.test(p))t+="\nKeywords: "+B.vocab;
 if(o.len==="Short")t=t.split("\n\n")[0];
 if(o.len==="Long"&&!/title|Twitter/.test(p))t+="\n\nWhy it works: it leads with a hook, speaks to "+a+" directly and ends with one clear action.";
 if(useB&&B.avoid)B.avoid.split(",").map(w=>w.trim()).filter(Boolean).forEach(w=>t=t.replace(new RegExp("\\b"+w.replace(/\W/g,"")+"\\b","gi"),""));
 return t;
}
const TX={
 Rewrite:t=>{const l=t.split("\n");l[0]=l[0].replace(/^(Here is what nobody tells you about|Stop scrolling. This changes|Plot twist: we just started)/,"Quick update on");return l.join("\n")},
 Shorten:t=>{const l=t.split("\n").filter(x=>x.trim());return l.slice(0,Math.max(1,Math.ceil(l.length*.6))).join("\n")},
 Expand:t=>t+"\n\nWhy it matters: clear messaging helps your audience understand the value in seconds.",
 Improve:t=>(/\?/.test(t.split("\n")[0])?t:"Ready for a change? "+t)+(/follow|sign up|order|share/i.test(t)?"":"\nTap the link to learn more."),
 Summarize:t=>t.split("\n").filter(x=>x.trim())[0]+" (summary)"};
/* ---------- quality analyzer (heuristic estimates) ---------- */
const STOP="about,their,there,which,would,these,those,where,while,because,being,after,before".split(",");
function analyze(t,kw){
 const w=t.match(/[\w']+/g)||[],sn=t.split(/[.!?\n]+/).filter(x=>x.trim()),avg=w.length/Math.max(1,sn.length),cl=n=>Math.max(0,Math.min(100,Math.round(n)));
 const freq={};w.forEach(x=>{x=x.toLowerCase();if(x.length>4&&!STOP.includes(x))freq[x]=(freq[x]||0)+1});
 const keys=kw?kw.split(",").map(x=>x.trim().toLowerCase()).filter(Boolean):Object.keys(freq).sort((a,b)=>freq[b]-freq[a]).slice(0,3);
 const hits=keys.filter(k=>t.toLowerCase().includes(k)).length,first=(sn[0]||"");
 const dens=keys.length?keys.reduce((s,k)=>s+(t.toLowerCase().split(k).length-1),0)/Math.max(1,w.length)*100:0;
 const rep=(t.match(/\b(\w+) \1\b/gi)||[]).length,dbl=(t.match(/  +/g)||[]).length,low=sn.filter(x=>/^[a-z]/.test(x.trim())).length;
 const R={Readability:cl(100-Math.abs(avg-14)*3),SEO:cl(40+(keys.length&&t.toLowerCase().includes(keys[0])&&first.toLowerCase().includes(keys[0])?20:0)+(/#/.test(t)?10:0)+(w.length>=20?15:0)+(/https?|link|bio/i.test(t)?10:0)),
 Grammar:cl(100-rep*12-dbl*8-low*8),Engagement:cl(40+(/[?!:]/.test(first)||first.length<70?20:0)+(/follow|sign up|order|share|subscribe|tap/i.test(t)?20:0)+(/\p{Extended_Pictographic}/u.test(t)?10:0)+(/\d/.test(t)?5:0)),
 "Keyword usage":cl(keys.length?(hits/keys.length)*60+(dens>=1&&dens<=4?40:15):30)};
 const sc=Object.values(R),all=Math.round(sc.reduce((a,b)=>a+b,0)/sc.length),tips=[];
 if(R.Readability<70)tips.push("Sentences average "+avg.toFixed(1)+" words. Aim for 10-18.");
 if(R.SEO<70)tips.push("Put your main keyword in the first line and add a hashtag or link cue.");
 if(R.Grammar<90)tips.push("Check repeated words, double spaces and sentence capitalization.");
 if(R.Engagement<70)tips.push("Open with a hook (question or bold claim) and end with one clear call to action.");
 if(R["Keyword usage"]<70)tips.push("Use your target keywords naturally, around 1-4% density.");
 if(!tips.length)tips.push("No major issues found by these simple checks.");
 return{R,all,tips,keys,words:w.length};
}
const lerp=t=>analyze(t).all;
/* ---------- app state & router ---------- */
const cs={idea:"",plat:"Instagram caption",tone:"Friendly",lang:"English",aud:"Gen Z",goal:"Get followers",len:"Medium",brand:true,vars:null,pick:-1};
const NAV=[["create","Create"],["lab","Prompt Lab"],["brand","Brand Voice"],["quality","Quality Analyzer"],["versions","Versions"],["calendar","Calendar"],["analytics","Analytics"],["insights","Developer Insights"]];
$("#nav").innerHTML+=NAV.map(n=>`<a href="#${n[0]}" data-n="${n[0]}">${n[1]}</a>`).join("");
const opts=(l,v)=>l.map(x=>`<option${x===v?" selected":""}>${x}</option>`).join("");
const sel=(id,l,v)=>`<select id="${id}">${opts(l,v)}</select>`;
const pills=(k,l)=>`<div class="chips">${l.map(x=>`<button class="chip${cs[k]===x?" on":""}" data-pill="${k}" data-v="${esc(x)}">${esc(x)}</button>`).join("")}</div>`;
const V={};
V.create=()=>`<h2>Create</h2><p class="sub">Generate three variations, compare them, then save or refine.</p>
<div class="grid"><div>
<div class="card"><label class="l" for="idea">Your idea</label><textarea id="idea" maxlength="500" placeholder="${EX[0]}">${esc(cs.idea)}</textarea>
<div class="chips">${EX.map(x=>`<button class="chip" data-ex="${esc(x)}">${esc(x)}</button>`).join("")}</div>
<label class="l">Audience</label>${pills("aud",AUD)}<label class="l">Goal</label>${pills("goal",GOAL)}
<div class="row"><div><label class="l" for="plat">Platform / format</label>${sel("plat",Object.keys(PL),cs.plat)}</div><div><label class="l" for="tone">Tone</label>${sel("tone",["Friendly","Professional","Bold","Funny"],cs.tone)}</div>
<div><label class="l" for="lang">Language</label>${sel("lang",["English","Hinglish"],cs.lang)}</div><div><label class="l" for="len">Length</label>${sel("len",["Short","Medium","Long"],cs.len)}</div></div>
<label class="l"><input type="checkbox" id="usebrand" style="width:auto"${cs.brand?" checked":""}> Apply brand voice ${S.brand.name?"("+esc(S.brand.name)+")":"(none saved yet)"}</label>
<div class="btns"><button class="btn" id="gen">Generate 3 variations</button><button class="btn alt" id="all">Create everywhere</button></div></div>
<div id="res"></div>
<div class="card"><h3>Visuals</h3><div class="btns" style="margin-top:0"><button class="btn alt" id="gt">Make thumbnail</button><button class="btn alt" id="gv">Generate video</button></div>
<p class="sub" style="margin-top:8px">Works offline. Video generation is not connected.</p><div id="vbox" class="empty" style="margin-top:8px">Your thumbnail appears here.</div></div></div>
<aside class="card"><b>Live preview</b><div class="ig" style="margin-top:10px"><div class="img" id="pimg">Your idea appears here</div><div class="cap" id="pcap">Type an idea to see the post preview.</div></div></aside></div>`;
function opt(){return{idea:cs.idea,lang:cs.lang,tone:cs.tone,aud:cs.aud,goal:cs.goal,len:cs.len,brand:cs.brand}}
function varCard(v,i){const a=analyze(v.text),lim=PL[v.plat];return `<div class="card hov"><div class="meta"><b>${v.name}</b><span>${v.plat}</span><span class="badge">Est. score ${a.all}</span>${cs.pick===i?'<span class="badge">Preferred</span>':""}</div><pre>${esc(v.text)}</pre>
<div class="meta"><span style="${v.text.length>lim?"color:var(--bad);font-weight:700":""}">${v.text.length}/${lim} chars</span><span>${a.words} words</span><span>${v.id?"Saved":"Unsaved"}</span><span class="badge">${v.src?esc(v.src)+" · "+(v.ms/1000).toFixed(1)+"s":"Template fallback, not AI"}</span></div>
<div class="btns" style="margin-top:8px">${Object.keys(TX).map(k=>`<button class="sm" data-tx="${k}" data-i="${i}">${k}</button>`).join("")}<button class="sm" data-copy="${i}">Copy</button><button class="sm" data-save="${i}">Save</button><button class="sm" data-pick="${i}">Prefer</button></div></div>`}
function showVars(){const r=$("#res");if(!cs.vars){r.innerHTML="";return}
 r.innerHTML=cs.vars.map(varCard).join("")+`<div class="card"><h3>Side-by-side comparison (estimates)</h3><div style="overflow-x:auto"><table><tr><th>Version</th><th>Tone cues</th><th>Readability</th><th>Words</th><th>Structure</th><th>Quality</th></tr>${cs.vars.map((v,i)=>{const a=analyze(v.text);return `<tr><td>${v.name}${cs.pick===i?" ✓":""}</td><td>${(v.text.match(/!|\p{Extended_Pictographic}/gu)||[]).length} exclaim/emoji</td><td>${a.R.Readability}</td><td>${a.words}</td><td>${v.text.split("\n").filter(x=>x.trim()).length} lines</td><td>${a.all}</td></tr>`}).join("")}</table></div></div>`}
async function gen(all){const b=$(all?"#all":"#gen");b.disabled=true;b.innerHTML='<span class="spin"></span>Generating...';$("#res").innerHTML='<div class="card empty">Working... a local model can take a while.</div>';
 const body=p=>JSON.stringify({idea:cs.idea||EX[0],platform:p,audience:cs.aud,tone:cs.tone,language:cs.lang,length:cs.len,goal:cs.goal,variations:all?1:3,brand:cs.brand&&S.brand.name?S.brand:null});
 const plats=all?Object.keys(PL):[cs.plat];let vars=[],err="";
 try{for(const p of plats){const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:body(p)});
   if(r.status===503)throw new Error("down");if(r.status===422)throw new Error("Please enter at least 3 characters for your idea.");if(!r.ok)throw new Error("Request failed ("+r.status+")");
   const d=await r.json();d.variations.forEach((x,i)=>vars.push({name:all?p:"Variation "+(i+1),plat:p,text:x.text,ms:x.ms,src:"Local model: "+d.model}))}}
 catch(e){vars=[];if(e.message==="down"||e instanceof TypeError){const o=opt();vars=all?Object.keys(PL).map(p=>({name:p,plat:p,text:build(p,0,o)})):["Safe","Bold","Funny"].map((n,i)=>({name:n,plat:cs.plat,text:build(cs.plat,i,o)}));toast("Local AI unavailable: showing template fallback")}else err=e.message}
 b.disabled=false;b.textContent=all?"Create everywhere":"Generate 3 variations";
 if(!vars.length){$("#res").innerHTML='<div class="card empty">'+esc(err||"Generation failed.")+'</div>';return}
 cs.pick=-1;cs.vars=vars;S.gen=(S.gen||0)+vars.length;log("Generated "+vars.length+" item(s)");save();showVars()}
function saveVar(i){const v=cs.vars[i];if(v.id){const it=S.items.find(x=>x.id===v.id);if(it){it.text=v.text;it.vers.unshift({t:Date.now(),text:v.text,note:"Edited"})}}
 else{v.id="c"+Date.now()+i;S.items.unshift({id:v.id,title:(cs.idea||EX[0]).slice(0,48)+" ("+v.plat+")",plat:v.plat,text:v.text,status:"Draft",date:"",fav:false,vers:[{t:Date.now(),text:v.text,note:"Generated "+v.name}]})}
 fetch("/api/projects",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:v.name+" "+v.plat,platform:v.plat,text:v.text})}).catch(()=>{});log("Saved "+v.plat);save();toast("Saved to projects")}
function prev(){const i=cs.idea.trim();$("#pimg").textContent=i||"Your idea appears here";$("#pcap").textContent=i?hook(i,0,false)+" "+CTA[cs.goal]:"Type an idea to see the post preview."}
const STY=["#7c3aed","#2563eb"];
function thumb(){const w=1280,h=720,c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d"),g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,STY[0]);g.addColorStop(1,STY[1]);x.fillStyle=g;x.fillRect(0,0,w,h);
 x.fillStyle="rgba(255,255,255,.12)";x.beginPath();x.arc(w*.85,h*.2,h*.3,0,7);x.fill();x.fillStyle="#fff";const fs=62;x.font="800 "+fs+"px system-ui,sans-serif";x.textBaseline="top";
 let line="",y=h*.28;build("YouTube title",1,opt()).split(" ").forEach(wd=>{const t=line+wd+" ";if(x.measureText(t).width>w*.8&&line){x.fillText(line,w*.08,y);y+=fs*1.2;line=wd+" "}else line=t});x.fillText(line,w*.08,y);
 x.font="600 28px system-ui,sans-serif";x.fillText("ContentStudio AI",w*.08,h*.88);const b=$("#vbox");b.className="";b.innerHTML="";b.appendChild(c);
 const a=document.createElement("button");a.className="sm";a.textContent="Download PNG";a.onclick=()=>{const l=document.createElement("a");l.href=c.toDataURL("image/png");l.download="thumbnail.png";l.click()};b.appendChild(a);log("Made thumbnail");save()}
/* ---------- Prompt Lab ---------- */
const labCS={tpl:"Instagram",sys:TPL.Instagram[0],usr:TPL.Instagram[1],base:"Write something about my product.",res:null};
function lab(sys,usr){const p=(sys+" "+usr).toLowerCase(),m=usr.match(/about:?\s*(.+?)(\.|$)/i),idea=(m?m[1]:usr).replace(/\[topic\]/,"your product").trim()||"your idea",au=(p.match(/gen z|founders|parents|professionals|students|customers|beginners/)||[])[0];
 let o=[/question/.test(p)?"Ever wondered about "+idea.toLowerCase()+"?":cap(idea)+"."];
 if(au)o.push("Written for "+au+".");if(/bullet|list/.test(p))o.push("- Point one\n- Point two\n- Point three");
 if(/story/.test(p))o.push("Here is the story behind it.");if(/hashtag/.test(p))o.push("#"+idea.split(" ")[0].replace(/\W/g,"")+" #new #trending");
 if(/bold/.test(p))o[0]=o[0].toUpperCase();if(/emoji/.test(p))o[0]+=" ✨";if(/cta|call to action|sign up/.test(p))o.push("Sign up free today.");
 if(/short|concise/.test(p))o=o.slice(0,2);return o.join("\n")}
function optimize(u){const t=[],l=u.toLowerCase();let n=u.trim();
 if(!/audience|for (gen z|founders|parents|students)/.test(l)){t.push("Name the audience.");n+=" Audience: Gen Z."}
 if(!/tone|friendly|bold|professional|funny/.test(l)){t.push("Specify a tone.");n+=" Tone: friendly."}
 if(!/call to action|cta|sign up/.test(l)){t.push("Ask for a clear call to action.");n+=" End with a call to action."}
 if(!/short|concise|words|characters|under/.test(l)){t.push("Add a length constraint.");n+=" Keep it concise."}
 if(!/about:?/.test(l)){t.push("State the topic explicitly (about: ...).");n=n.replace(/^(\S+ \S+ \S+)/,"$1 about: [topic].")}
 if(!t.length)t.push("Prompt already covers audience, tone, CTA and length.");return{t,n}}
V.lab=()=>`<h2>Prompt Intelligence Lab</h2><p class="sub">Write, test and improve prompts. The demo engine reacts to keywords in your prompt (audience, tone, bullets, CTA, length) so you can see how wording changes output. A real model would be far richer.</p>
<div class="card"><div class="row"><div><label class="l" for="tpl">Template</label>${sel("tpl",Object.keys(TPL),labCS.tpl)}</div><div><label class="l" for="pn">Prompt name</label><input id="pn" maxlength="60" placeholder="My Instagram prompt"></div></div>
<label class="l" for="sys">System prompt</label><textarea id="sys">${esc(labCS.sys)}</textarea><label class="l" for="usr">User prompt (use [topic])</label><textarea id="usr">${esc(labCS.usr)}</textarea>
<label class="l" for="base">Baseline prompt (for before / after)</label><textarea id="base">${esc(labCS.base)}</textarea>
<div class="btns"><button class="btn" id="run">Run test</button><button class="btn alt" id="opt">Suggest improvements</button><button class="btn alt" id="sp">Save prompt</button></div></div><div id="labout"></div>
<div class="card"><h3>Saved prompts</h3>${S.prompts.length?S.prompts.map((p,i)=>`<div class="meta" style="margin:6px 0"><b>${esc(p.name)}</b><span>${fmt(p.t)}</span><button class="sm" data-lp="${i}">Load</button><button class="sm" data-ld="${i}">Delete</button></div>`).join(""):'<div class="empty">No saved prompts yet. Write one and press Save prompt.</div>'}</div>`;
function labRead(){labCS.tpl=$("#tpl").value;labCS.sys=$("#sys").value;labCS.usr=$("#usr").value;labCS.base=$("#base").value}
function labShow(extra){const r=labCS.res;$("#labout").innerHTML=(extra||"")+(r?`<div class="card"><h3>Before and after</h3><div class="g2"><div><b>Before</b><pre>${esc(r.b)}</pre><span class="badge">Est. ${lerp(r.b)}</span></div><div><b>After</b><pre>${esc(r.a)}</pre><span class="badge">Est. ${lerp(r.a)}</span></div></div>
<h3 style="margin-top:12px">Variation experiment</h3><table><tr><th>Variation</th><th>Output</th><th>Est.</th></tr>${r.v.map(x=>`<tr><td>${x[0]}</td><td>${esc(x[1]).replace(/\n/g,"<br>")}</td><td>${lerp(x[1])}</td></tr>`).join("")}</table></div>`:"")}
/* ---------- other views ---------- */
V.brand=()=>{const b=S.brand;return `<h2>Brand Voice</h2><p class="sub">Saved settings are applied to every generation when “Apply brand voice” is on.</p><div class="card"><div class="row"><div><label class="l" for="bn">Brand name</label><input id="bn" maxlength="60" value="${esc(b.name)}"></div><div><label class="l" for="bt">Tone</label>${sel("bt",["Friendly","Professional","Bold","Funny"],b.tone)}</div></div>
<label class="l" for="ba">Target audience</label><input id="ba" maxlength="120" value="${esc(b.aud)}"><label class="l" for="bv">Preferred vocabulary (comma separated)</label><input id="bv" maxlength="160" value="${esc(b.vocab)}"><label class="l" for="bx">Words to avoid (comma separated)</label><input id="bx" maxlength="160" value="${esc(b.avoid)}">
<div class="btns"><button class="btn" id="bs">Save brand profile</button><button class="btn alt" id="bc">Clear</button></div></div>`};
V.quality=()=>`<h2>Content Quality Analyzer</h2><p class="sub">Scores are heuristic estimates of writing quality, not predictions of real engagement.</p><div class="card"><label class="l" for="qt">Paste content</label><textarea id="qt" maxlength="5000" style="min-height:140px"></textarea><label class="l" for="qk">Target keywords (optional, comma separated)</label><input id="qk"><div class="btns"><button class="btn" id="qa">Analyze</button><button class="btn alt" id="qs">Load latest saved item</button></div></div><div id="qout"><div class="empty">Paste text and press Analyze.</div></div>`;
V.versions=()=>{if(!S.items.length)return `<h2>Version History</h2><div class="empty">Nothing saved yet. Generate content on Create and press Save.</div>`;const it=S.items.find(x=>x.id===vs.id)||S.items[0];vs.id=it.id;
 return `<h2>Version History</h2><div class="card"><label class="l" for="vi">Project</label><select id="vi">${S.items.map(x=>`<option value="${x.id}"${x.id===it.id?" selected":""}>${esc(x.title)}</option>`).join("")}</select>
<table style="margin-top:10px">${it.vers.map((v,i)=>`<tr><td>v${it.vers.length-i}</td><td>${fmt(v.t)}</td><td>${esc(v.note)}</td><td><button class="sm" data-vr="${i}">Restore</button></td></tr>`).join("")}</table></div>
<div class="card"><h3>Compare drafts</h3><div class="row"><div><label class="l" for="va">Older</label><select id="va">${it.vers.map((v,i)=>`<option value="${i}"${i===it.vers.length-1?" selected":""}>v${it.vers.length-i}</option>`).join("")}</select></div><div><label class="l" for="vb">Newer</label><select id="vb">${it.vers.map((v,i)=>`<option value="${i}">v${it.vers.length-i}</option>`).join("")}</select></div></div><div class="btns"><button class="btn" id="vc">Compare</button></div><div id="vd" style="margin-top:10px"></div></div>`};
const vs={id:null};
const cc={m:new Date(),mode:"Month",day:null};
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
V.calendar=()=>{const m=cc.m,first=new Date(m.getFullYear(),m.getMonth(),1);let start=new Date(first);start.setDate(1-first.getDay());let n=42;
 if(cc.mode==="Week"){const s=new Date(cc.m);s.setDate(s.getDate()-s.getDay());start=s;n=7}
 const cells=[];for(let i=0;i<n;i++){const d=new Date(start);d.setDate(start.getDate()+i);const k=iso(d),ev=S.items.filter(x=>x.date===k);
  cells.push(`<div class="day${d.getMonth()!==m.getMonth()&&n>7?" dim":""}${cc.day===k?" sel":""}" data-day="${k}"><em>${d.getDate()}</em>${ev.map(e=>`<span class="ev ${e.status.replace(" ","-")}">${esc(e.title)}</span>`).join("")}</div>`)}
 const cnt=s=>S.items.filter(x=>x.status===s).length,un=S.items.filter(x=>!x.date);
 return `<h2>Content Calendar</h2><div class="g4">${["Draft","In Review","Approved","Published"].map(s=>`<div class="card stat"><b>${cnt(s)}</b><span>${s}</span></div>`).join("")}</div>
<div class="card"><div class="btns" style="margin:0 0 10px"><button class="sm" id="cp">&lt; Prev</button><b>${m.toLocaleString([], {month:"long",year:"numeric"})}</b><button class="sm" id="cn">Next &gt;</button><button class="chip${cc.mode==="Month"?" on":""}" data-cm="Month">Month</button><button class="chip${cc.mode==="Week"?" on":""}" data-cm="Week">Week</button></div>
<div class="cal">${"Sun Mon Tue Wed Thu Fri Sat".split(" ").map(x=>`<b style="font-size:11px;text-align:center">${x}</b>`).join("")}${cells.join("")}</div></div>
<div class="card"><h3>Schedule ${cc.day?"for "+cc.day:""}</h3>${S.items.length?`<p class="sub">Select a day, pick a draft, set a status.</p><div class="row"><div><label class="l" for="ci">Draft</label><select id="ci">${S.items.map(x=>`<option value="${x.id}">${esc(x.title)} [${x.status}${x.date?" "+x.date:""}]</option>`).join("")}</select></div><div><label class="l" for="cst">Status</label>${sel("cst",["Draft","In Review","Approved","Published"],"Draft")}</div></div><div class="btns"><button class="btn" id="csb">Schedule on selected day</button><button class="btn alt" id="cun">Unschedule</button></div>`:'<div class="empty">No drafts yet. Save content from Create to plan it here.</div>'}</div>`};
V.analytics=()=>{const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d}),cnt=days.map(d=>S.log.filter(l=>iso(new Date(l.t))===iso(d)).length),mx=Math.max(1,...cnt);
 return `<h2>Analytics</h2><div class="g4">${[["Generated",S.gen||0],["Saved projects",S.items.length],["Prompt experiments",S.exp],["Favorites",S.items.filter(x=>x.fav).length]].map(x=>`<div class="card stat hov"><b>${x[1]}</b><span>${x[0]}</span></div>`).join("")}</div>
<div class="card"><h3>Activity, last 7 days</h3><svg viewBox="0 0 350 130" width="100%" role="img" aria-label="Bar chart of actions per day"><defs><linearGradient id="gg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs>${cnt.map((c,i)=>`<rect x="${i*50+8}" y="${100-c/mx*90}" width="34" height="${c/mx*90}" rx="5" fill="url(#gg)"><title>${days[i].toDateString()}: ${c}</title></rect><text x="${i*50+25}" y="116" font-size="10" text-anchor="middle" fill="currentColor">${days[i].toLocaleString([], {weekday:"short"})}</text><text x="${i*50+25}" y="${96-c/mx*90}" font-size="10" text-anchor="middle" fill="currentColor">${c||""}</text>`).join("")}</svg></div>
<div class="card"><h3>Recent activity</h3>${S.log.length?S.log.slice(0,8).map(l=>`<div class="meta" style="margin:4px 0"><span>${fmt(l.t)}</span><span>${esc(l.m)}</span></div>`).join(""):'<div class="empty">No activity yet.</div>'}</div>
<div class="card"><h3>Favorites</h3>${S.items.length?S.items.map(x=>`<div class="meta" style="margin:4px 0"><button class="sm" data-fav="${x.id}">${x.fav?"★":"☆"}</button>${esc(x.title)}</div>`).join(""):'<div class="empty">Save content to favorite it.</div>'}</div>`};
V.insights=()=>{const s=lab("You write punchy captions.","Write a caption about: a home bakery. Audience: parents. Include a call to action."),s2=lab("Be concise.","Write a caption about: a home bakery.");
 return `<h2>Developer Insights</h2><p class="sub">How this project is built, and what is real versus demo.</p>
<div class="card"><h3>Prompt engineering workflow</h3><div class="flow"><span>Template</span><b>→</b><span>System + user prompt</span><b>→</b><span>Optimizer checks gaps</span><b>→</b><span>Run baseline vs improved</span><b>→</b><span>Score and compare</span><b>→</b><span>Save version</span></div></div>
<div class="g2"><div class="card"><h3>Live example (runs the demo engine now)</h3><b>Prompt A</b><pre>Be concise. Write a caption about: a home bakery.</pre><pre>${esc(s2)}</pre><b>Prompt B</b><pre>Write a caption about: a home bakery. Audience: parents. Include a call to action.</pre><pre>${esc(s)}</pre><span class="badge">A ${lerp(s2)} vs B ${lerp(s)} (estimates)</span><p class="sub">Experiments you ran in the Lab: ${S.exp}.</p></div>
<div class="card"><h3>Architecture (this build)</h3><div class="flow"><span>UI views</span><b>→</b><span>Hash router</span><b>→</b><span>Generation engine</span><b>→</b><span>Analyzer</span><b>→</b><span>localStorage</span></div><p class="sub" style="margin-top:10px">Production target: React/Vite client, Node + Express API, JWT auth, Postgres per-user data, LLM provider call server-side with keys in environment variables.</p></div></div>
<div class="card"><h3>API workflow (target design)</h3><table><tr><th>Endpoint</th><th>Purpose</th></tr><tr><td>POST /api/auth/login</td><td>Issue session token</td></tr><tr><td>POST /api/generate</td><td>Validate input, build prompt, call LLM, return variations</td></tr><tr><td>POST /api/analyze</td><td>Score content</td></tr><tr><td>GET/POST /api/projects</td><td>Per-user saved items and versions</td></tr><tr><td>GET/POST /api/schedule</td><td>Calendar entries and status</td></tr></table></div>
<div class="g2"><div class="card"><h3>Technologies</h3><div class="chips">${["HTML5","CSS variables","Vanilla JS","SVG charts","Canvas","localStorage"].map(x=>`<span class="chip">${x}</span>`).join("")}</div></div>
<div class="card"><h3>Challenges and solutions</h3><p><b>Honest AI labeling:</b> every output is tagged as demo and scores as estimates.<br><b>Rendering without framework:</b> small view functions and event delegation keep it modular.<br><b>Safe storage:</b> try/catch around storage, HTML escaping for user text.</p></div></div>
<div class="card"><h3>Not yet implemented</h3><p class="sub">Real authentication, a backend database, and a live LLM call need a server. They are not in this single-file build, and no part of this page pretends otherwise.</p></div>`};
/* ---------- events ---------- */
function route(){const k=(location.hash||"#create").slice(1),n=V[k]?k:"create";$("#view").innerHTML=V[n]();document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("on",a.dataset.n===n));
 if(n==="create"){showVars();prev()}if(n==="lab")labShow();if(n==="analytics")loadStats();window.scrollTo(0,0)}
addEventListener("hashchange",route);
document.addEventListener("input",e=>{const i=e.target.id;if(i==="idea"){cs.idea=e.target.value;prev()}});
document.addEventListener("change",e=>{const i=e.target.id;
 if(["plat","tone","lang","len"].includes(i))cs[i]=e.target.value;if(i==="usebrand")cs.brand=e.target.checked;
 if(i==="tpl"){labCS.tpl=e.target.value;labCS.sys=TPL[e.target.value][0];labCS.usr=TPL[e.target.value][1];labCS.res=null;route()}
 if(i==="vi"){vs.id=e.target.value;route()}});
document.addEventListener("click",e=>{const t=e.target.closest("button,.day");if(!t)return;const d=t.dataset,id=t.id;
 if(d.pill){cs[d.pill]=d.v;route();$("#idea").value=cs.idea;return}
 if(d.ex){cs.idea=d.ex;$("#idea").value=d.ex;prev()}
 if(id==="gen")gen(false);if(id==="all")gen(true);if(id==="gt")thumb();if(id==="gv"){const b=$("#vbox");b.className="empty";b.textContent="Video generation is not connected. Add a video API (Veo, Runway or Luma) on a server to enable it."}
 if(d.tx){const v=cs.vars[d.i];v.text=TX[d.tx](v.text);if(v.id){const it=S.items.find(x=>x.id===v.id);if(it){it.text=v.text;it.vers.unshift({t:Date.now(),text:v.text,note:d.tx});save()}}log(d.tx+" applied");showVars()}
 if(d.copy){navigator.clipboard&&navigator.clipboard.writeText(cs.vars[d.copy].text).catch(()=>{});toast("Copied")}
 if(d.save){saveVar(+d.save);showVars()}if(d.pick){cs.pick=+d.pick;showVars()}
 if(id==="run"||id==="opt"||id==="sp"){labRead();
  if(id==="run")runLab();
  if(id==="opt"){const o=optimize(labCS.usr);labShow(`<div class="card"><h3>Suggestions</h3><ul>${o.t.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><b>Improved prompt</b><pre>${esc(o.n)}</pre><button class="btn alt" id="apply" data-p="${esc(o.n)}">Use improved prompt</button></div>`)}
  if(id==="sp"){const n=$("#pn").value.trim()||"Untitled prompt";S.prompts.unshift({name:n,t:Date.now(),sys:labCS.sys,usr:labCS.usr,tpl:labCS.tpl});save();log("Saved prompt "+n);toast("Prompt saved");route()}}
 if(id==="apply"){labCS.base=labCS.usr;labCS.usr=d.p;labCS.res=null;route();toast("Applied. Press Run test.")}
 if(d.lp!==undefined){const p=S.prompts[d.lp];Object.assign(labCS,{sys:p.sys,usr:p.usr,tpl:p.tpl,res:null});route()}
 if(d.ld!==undefined){S.prompts.splice(d.ld,1);save();route()}
 if(id==="bs"){S.brand={name:$("#bn").value.trim(),tone:$("#bt").value,aud:$("#ba").value.trim(),vocab:$("#bv").value.trim(),avoid:$("#bx").value.trim()};if(!S.brand.name){toast("Enter a brand name");return}log("Saved brand "+S.brand.name);save();toast("Brand saved")}
 if(id==="bc"){S.brand={name:"",tone:"Friendly",aud:"",vocab:"",avoid:""};save();route()}
 if(id==="qs"){const it=S.items[0];if(!it){toast("No saved items yet");return}$("#qt").value=it.text}
 if(id==="qa"){const t=$("#qt").value.trim();if(t.length<10){toast("Paste at least a sentence");return}const a=analyze(t,$("#qk").value);log("Analyzed content");save();
  $("#qout").innerHTML=`<div class="card"><h3>Overall estimate: ${a.all}/100</h3><p class="sub">Heuristic estimate. Not a prediction of real engagement.</p>${Object.entries(a.R).map(([k,v])=>`<div style="margin:8px 0"><div class="meta"><b>${k}</b><span>${v}</span></div><div class="bar"><i style="width:${v}%"></i></div></div>`).join("")}<h3>Suggestions</h3><ul>${a.tips.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><span class="sub">Keywords checked: ${esc(a.keys.join(", ")||"none")}</span></div>`}
 if(d.vr!==undefined){const it=S.items.find(x=>x.id===vs.id),v=it.vers[d.vr];it.text=v.text;it.vers.unshift({t:Date.now(),text:v.text,note:"Restored from "+fmt(v.t)});log("Restored a version");save();toast("Restored as newest version");route()}
 if(id==="vc"){const it=S.items.find(x=>x.id===vs.id),a=it.vers[$("#va").value].text.split(/\s+/),b=it.vers[$("#vb").value].text.split(/\s+/),sa=new Set(a),sb=new Set(b);
  $("#vd").innerHTML=`<div class="g2"><div class="card"><b>Older</b><pre>${a.map(w=>sb.has(w)?esc(w):"<del>"+esc(w)+"</del>").join(" ")}</pre></div><div class="card"><b>Newer</b><pre>${b.map(w=>sa.has(w)?esc(w):"<ins>"+esc(w)+"</ins>").join(" ")}</pre></div></div>`}
 if(d.day){cc.day=d.day;route()}if(d.cm){cc.mode=d.cm;route()}
 if(id==="cp"||id==="cn"){const s=cc.mode==="Week"?7:0;if(s)cc.m.setDate(cc.m.getDate()+(id==="cn"?7:-7));else cc.m=new Date(cc.m.getFullYear(),cc.m.getMonth()+(id==="cn"?1:-1),1);route()}
 if(id==="csb"){if(!cc.day){toast("Select a day first");return}const it=S.items.find(x=>x.id===$("#ci").value);it.date=cc.day;it.status=$("#cst").value;log("Scheduled "+it.plat+" on "+cc.day);save();route()}
 if(id==="cun"){const it=S.items.find(x=>x.id===$("#ci").value);it.date="";save();route()}
 if(d.fav){const it=S.items.find(x=>x.id===d.fav);it.fav=!it.fav;save();route()}});
route();

async function runLab(){const r=$("#run");r.disabled=true;r.innerHTML='<span class="spin"></span>Running...';
 const U=labCS.usr,vs=[["Baseline",labCS.base],["As written",U],["+ bullets",U+" Use a bullet list."],["+ question hook, emoji",U+" Open with a question. Add an emoji."],["+ short",U+" Keep it short."]];let rows;
 try{const resp=await fetch("/api/prompts/experiment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system:labCS.sys,variants:vs.map(v=>({label:v[0],prompt:v[1]}))})});
  if(!resp.ok)throw new Error("down");const d=await resp.json();rows=d.results.map(x=>[x.label+" ("+(x.ms/1000).toFixed(1)+"s, "+d.model+")",x.output])}
 catch(e){rows=vs.map(v=>[v[0]+" (template fallback, not AI)",lab(v[0]==="Baseline"?"":labCS.sys,v[1])]);toast("Local AI unavailable: showing template fallback")}
 labCS.res={b:rows[0][1],a:rows[1][1],v:rows.slice(1)};S.exp++;log("Ran prompt experiment");save();r.disabled=false;r.textContent="Run test";labShow()}
async function loadStats(){const el=document.createElement("div");el.className="card";let h="<h3>Local database stats (SQLite)</h3>";
 try{const r=await fetch("/api/analytics");if(!r.ok)throw 0;const a=await r.json();
  h+=`<div class="g4">${[["Generations",a.generations],["Projects",a.projects],["Experiments",a.experiments],["Avg generation",a.avg_ms?(a.avg_ms/1000).toFixed(1)+"s":"n/a"]].map(x=>`<div class="stat"><b>${x[1]}</b><span>${x[0]}</span></div>`).join("")}</div><p class="sub">Top platforms: ${esc(a.platforms.map(p=>p.platform+" ("+p.n+")").join(", ")||"none yet")}</p>`}
 catch(e){h+='<div class="empty">Backend not running, so no database stats. Start it with uvicorn.</div>'}
 h+='<h3 style="margin-top:12px">Export saved projects</h3><div class="btns" style="margin-top:0"><button class="sm" data-exp="txt">TXT</button><button class="sm" data-exp="json">JSON</button><button class="sm" data-exp="csv">CSV</button></div>';
 el.innerHTML=h;if(location.hash==="#analytics")$("#view").appendChild(el)}
function expo(f){if(!S.items.length){toast("Nothing to export yet");return}let c,m;
 if(f==="json"){c=JSON.stringify(S.items,null,2);m="application/json"}
 else if(f==="csv"){const q=s=>'"'+String(s).replace(/"/g,'""')+'"';c="title,platform,status,date,text\n"+S.items.map(i=>[i.title,i.plat,i.status,i.date,i.text].map(q).join(",")).join("\n");m="text/csv"}
 else{c=S.items.map(i=>i.title+"\n"+i.text).join("\n\n----\n\n");m="text/plain"}
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([c],{type:m}));a.download="contentstudio-export."+f;a.click()}
document.addEventListener("click",e=>{const b=e.target.closest("[data-exp]");if(b)expo(b.dataset.exp)});
fetch("/api/health").then(r=>r.json()).then(h=>{$("#banner").innerHTML=h.ai?`<b>Local AI connected.</b> Model: ${esc(h.model)}. Content stays on this machine. Quality scores are heuristic estimates, not model output.`:`<b>Local AI not reachable.</b> Start Ollama and run <code>ollama pull ${esc(h.model)}</code>. Until then, outputs are template fallback, not AI.`}).catch(()=>{$("#banner").innerHTML="<b>Backend not running.</b> Output is template fallback, not AI. Start the FastAPI server to use the local model."});
