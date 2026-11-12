/* ===== AeroDoX Flight Log: uydu haritası, telemetri, GPX 1.1, KML NOTAM, 90 gün saklama, Supabase senkronu ===== */
const FL=(()=>{
"use strict";
const RET_DAYS=90,DAY=864e5,WARN_M=500,FIX_MAX_AGE=10000,EMA=0.3;
const TILE="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

//#PURE-START
const R=6371008.8,rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
function haversine(a,b){const dLa=rad(b[0]-a[0]),dLo=rad(b[1]-a[1]);const h=Math.sin(dLa/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function bearing(a,b){const dLo=rad(b[1]-a[1]);const y=Math.sin(dLo)*Math.cos(rad(b[0]));const x=Math.cos(rad(a[0]))*Math.sin(rad(b[0]))-Math.sin(rad(a[0]))*Math.cos(rad(b[0]))*Math.cos(dLo);return(deg(Math.atan2(y,x))+360)%360}
function distSeg(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;const t=l2?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l2)):0;return Math.hypot(px-(ax+t*dx),py-(ay+t*dy))}
/* Tüm noktalar [enlem, boylam] sırasındadır. */
function pointInRing(p,ring){const py=p[0],px=p[1];let ins=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const yi=ring[i][0],xi=ring[i][1],yj=ring[j][0],xj=ring[j][1];if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi)ins=!ins}return ins}
function pointInPolygon(p,pg){return pointInRing(p,pg.outer)&&!pg.holes.some(h=>pointInRing(p,h))}
function distToRingEdge(p,ring){const cl=Math.cos(rad(p[0]));const xy=q=>[rad(q[1]-p[1])*R*cl,rad(q[0]-p[0])*R];let m=Infinity;for(let i=0;i<ring.length;i++){const a=xy(ring[i]),b=xy(ring[(i+1)%ring.length]);m=Math.min(m,distSeg(0,0,a[0],a[1],b[0],b[1]))}return m}
/* KRİTİK: KML "boylam,enlem,rakım" -> harita "enlem,boylam". Dönüşüm yalnızca burada yapılır. */
function parseCoords(s){return String(s).trim().split(/\s+/).map(t=>t.split(",").map(Number)).filter(a=>a.length>=2&&isFinite(a[0])&&isFinite(a[1])&&Math.abs(a[1])<=90&&Math.abs(a[0])<=180).map(a=>[a[1],a[0]])}
/* GPS okumasını telemetri noktasına çevirir. Rüzgar: balon rüzgarla sürüklendiği için yer hızı vektöründen tahmin edilir. */
function makePoint(pos,prev,baro){const c=pos.coords,ts=pos.timestamp,here=[c.latitude,c.longitude];const dt=prev?(ts-prev.ts)/1000:0;const d=prev&&dt>0?haversine([prev.lat,prev.lon],here):0;
 const gs=isFinite(c.speed)&&c.speed!==null?c.speed:dt>0?d/dt:0;
 let course=isFinite(c.heading)&&c.heading!==null?c.heading:(prev&&prev.course!=null?prev.course:null);
 if(!(isFinite(c.heading)&&c.heading!==null)&&d>0.5)course=bearing([prev.lat,prev.lon],here);
 const gpsAlt=c.altitude!=null&&isFinite(c.altitude)?c.altitude:null,baroAlt=baro==null?null:baro,ele=baroAlt!=null?baroAlt:gpsAlt;
 let vs=0;if(prev&&dt>0&&ele!=null&&prev.ele!=null)vs=prev.vs*(1-EMA)+((ele-prev.ele)/dt)*EMA;
 return{ts,t:new Date(ts).toISOString(),lat:c.latitude,lon:c.longitude,gpsAlt,baroAlt,ele,acc:c.accuracy,gs,course,vs,windSpeed:gs,windFrom:course==null?null:(course+180)%360}}
function flightFileName(d){d=d||new Date();const p=n=>String(n).padStart(2,"0");return`Flight_${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}.gpx`}
function flightStats(pts){let dist=0,maxAlt=-Infinity,maxClimb=0,maxSink=0;pts.forEach((p,i)=>{if(i)dist+=haversine([pts[i-1].lat,pts[i-1].lon],[p.lat,p.lon]);if(p.ele!=null)maxAlt=Math.max(maxAlt,p.ele);maxClimb=Math.max(maxClimb,p.vs);maxSink=Math.min(maxSink,p.vs)});
 return{distanceM:dist,maxAlt:isFinite(maxAlt)?maxAlt:null,maxClimb,maxSink,durationSec:pts.length>1?(pts[pts.length-1].ts-pts[0].ts)/1000:0}}
const xe=s=>String(s).replace(/[<>&"']/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"}[c]));
const nf=(n,d)=>Number(n).toFixed(d);
/* GPX 1.1. Hız/rota: Garmin TrackPointExtension v1. Tırmanış hızı, rüzgar, baro/GPS yükseklik: "bo" ad alanı (extensions). */
function buildGpx(pts,o){if(!pts.length)throw new Error("Boş uçuş");const la=pts.map(p=>p.lat),lo=pts.map(p=>p.lon);const desc=o.sim?"<desc>SIMULASYON / TEST KAYDI</desc>":"";
 const tp=pts.map(p=>`      <trkpt lat="${nf(p.lat,7)}" lon="${nf(p.lon,7)}">
${p.ele!=null?`        <ele>${nf(p.ele,1)}</ele>\n`:""}        <time>${p.t}</time>
        <extensions>
          <gpxtpx:TrackPointExtension>
            <gpxtpx:speed>${nf(p.gs,2)}</gpxtpx:speed>
${p.course!=null?`            <gpxtpx:course>${nf(p.course,1)}</gpxtpx:course>\n`:""}          </gpxtpx:TrackPointExtension>
          <bo:vspeed>${nf(p.vs,2)}</bo:vspeed>
${p.baroAlt!=null?`          <bo:baroAlt>${nf(p.baroAlt,1)}</bo:baroAlt>\n`:""}${p.gpsAlt!=null?`          <bo:gpsAlt>${nf(p.gpsAlt,1)}</bo:gpsAlt>\n`:""}          <bo:windSpeed>${nf(p.windSpeed,2)}</bo:windSpeed>
${p.windFrom!=null?`          <bo:windFrom>${nf(p.windFrom,1)}</bo:windFrom>\n`:""}        </extensions>
      </trkpt>`).join("\n");
 return`<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BalonEvrakYonetimi FlightLog"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
  xmlns:bo="https://balloon-ops.example/xmlschemas/v1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd">
  <metadata>
    <name>${xe(o.name)}</name>
    ${desc}
    <time>${new Date(o.startedAt).toISOString()}</time>
    <bounds minlat="${nf(Math.min(...la),7)}" minlon="${nf(Math.min(...lo),7)}" maxlat="${nf(Math.max(...la),7)}" maxlon="${nf(Math.max(...lo),7)}"/>
  </metadata>
  <trk>
    <name>${xe(o.name)}</name>
    <trkseg>
${tp}
    </trkseg>
  </trk>
</gpx>
`}
const fmtDur=ms=>{const s=Math.max(0,Math.floor(ms/1000)),p=n=>String(n).padStart(2,"0");return`${p(Math.floor(s/3600))}:${p(Math.floor(s%3600/60))}:${p(s%60)}`};
const isExpired=(f,now)=>f.createdAt<now-RET_DAYS*DAY;
//#PURE-END

/* ---------- durum ---------- */
function fresh(){return{co:null,root:null,map:null,sub:"map",status:"idle",fix:null,raw:null,cur:null,prevP:null,pts:[],t0:0,t1:0,now:0,follow:false,centered:false,err:"",
 kml:{polygons:[],lines:[],points:[]},kmlName:"",flights:[],last:null,fence:{level:"clear"},fenceKey:"clear",sim:false,watch:null,timer:null,purgeT:null,wake:null,
 note:"",noteT:null,persistent:true,simT:null,visH:null,alHtml:"",confirmId:null,confirmT:null,logoutArm:false,lastPurge:0,syncing:new Set(),syncErr:""}}
const Q=fresh();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const canDel=f=>(typeof isAdmin==="function"&&isAdmin())||f.sim;

/* ---------- depolama: IndexedDB (şirket başına ayrı), olmazsa bellek ---------- */
let dbp=null;const mem={flights:new Map(),meta:new Map()};
function openDB(){if(!dbp)dbp=new Promise((res,rej)=>{try{const r=indexedDB.open("aerodox-fl-"+Q.co,1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore("flights",{keyPath:"id"});d.createObjectStore("meta",{keyPath:"key"})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error||new Error("idb"));r.onblocked=()=>rej(new Error("blocked"))}catch(e){rej(e)}});return dbp}
async function tx(s,mode,fn){const db=await openDB();return new Promise((res,rej)=>{const t=db.transaction(s,mode);const rq=fn(t.objectStore(s));t.oncomplete=()=>res(rq?rq.result:undefined);t.onerror=t.onabort=()=>rej(t.error||new Error("tx"))})}
const keyOf=(s,v)=>s==="flights"?v.id:v.key;
async function dbPut(s,v){try{await tx(s,"readwrite",o=>o.put(v))}catch(e){Q.persistent=false;mem[s].set(keyOf(s,v),v)}}
async function dbDel(s,k){try{await tx(s,"readwrite",o=>o.delete(k))}catch(e){Q.persistent=false;mem[s].delete(k)}}
async function dbAll(s){try{return await tx(s,"readonly",o=>o.getAll())}catch(e){Q.persistent=false;return Array.from(mem[s].values())}}
async function dbGet(s,k){try{return await tx(s,"readonly",o=>o.get(k))}catch(e){Q.persistent=false;return mem[s].get(k)}}

/* ---------- sunucu (Supabase) senkronu ---------- */
const pilotName=()=>(S.profile&&S.profile.full_name)||(S.user&&S.user.email)||"";
async function gzip(text){if(typeof CompressionStream==="undefined")return null;try{return await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))).blob()}catch(e){return null}}
async function gunzip(blob){return await new Response(blob.stream().pipeThrough(new DecompressionStream("gzip"))).text()}
/* Önce cihaza kaydedilir (internet olmasa da kayıp olmaz), sonra sunucuya yüklenir; başarısız olursa sonra yeniden denenir */
async function syncFlight(rec){if(Q.syncing.has(rec.id))return false;Q.syncing.add(rec.id);
 try{const gzb=await gzip(rec.gpx),path=`${S.co}/flights/${rec.id}${gzb?".gpx.gz":".gpx"}`,blob=gzb||new Blob([rec.gpx],{type:"application/gpx+xml"});
  const up=await sb.storage.from("documents").upload(path,blob,{contentType:gzb?"application/gzip":"application/octet-stream"});
  if(up.error&&!/already exists|duplicate/i.test(up.error.message||""))throw up.error;
  const ins=await sb.from("flights").insert({id:rec.id,company_id:S.co,pilot_user:S.user.id,pilot_name:rec.pilotName||pilotName(),name:rec.name,started_at:new Date(rec.startedAt).toISOString(),ended_at:new Date(rec.endedAt).toISOString(),duration_sec:rec.durationSec,max_alt:rec.maxAlt,distance_m:rec.distanceM,point_count:rec.pointCount,sim:!!rec.sim,file_path:path});
  if(ins.error&&ins.error.code!=="23505")throw ins.error;
  rec.synced=true;rec.filePath=path;Q.syncErr="";await dbPut("flights",rec);return true}
 catch(e){Q.syncErr=errMsg(e);return false}finally{Q.syncing.delete(rec.id)}}
async function fetchRemote(){const cut=new Date(Date.now()-RET_DAYS*DAY).toISOString();const{data,error}=await sb.from("flights").select("*").gte("started_at",cut).order("started_at",{ascending:false}).limit(500);if(error)throw error;
 return(data||[]).map(x=>({id:x.id,name:x.name,createdAt:Date.parse(x.started_at),startedAt:Date.parse(x.started_at),endedAt:Date.parse(x.ended_at),durationSec:Number(x.duration_sec)||0,maxAlt:x.max_alt==null?null:Number(x.max_alt),distanceM:Number(x.distance_m)||0,pointCount:x.point_count,sim:!!x.sim,pilotName:x.pilot_name,filePath:x.file_path,synced:true}))}
/* 90 günü dolan sunucu kayıtları: önce dosya, sonra satır silinir (saatte en fazla bir kez) */
async function purgeRemote(){if(Date.now()-Q.lastPurge<36e5)return;Q.lastPurge=Date.now();const cut=new Date(Date.now()-RET_DAYS*DAY).toISOString();
 const{data,error}=await sb.from("flights").select("id,file_path").lt("started_at",cut).limit(200);if(error)throw error;if(!data||!data.length)return;
 const r1=await sb.storage.from("documents").remove(data.map(x=>x.file_path));if(r1.error)throw r1.error;
 const r2=await sb.from("flights").delete().in("id",data.map(x=>x.id));if(r2.error)throw r2.error}
/* 90 günlük saklama politikası (cihaz): süresi dolanlar silinir */
async function purge(){const now=Date.now();const old=(await dbAll("flights")).filter(f=>isExpired(f,now));await Promise.all(old.map(f=>dbDel("flights",f.id)));return old.length}
async function refreshFlights(){
 await purge();const loc=await dbAll("flights");let remote=[],ok=false;
 try{await purgeRemote()}catch(e){}
 try{remote=await fetchRemote();ok=true}catch(e){Q.syncErr=errMsg(e)}
 const by=new Map();remote.forEach(r=>by.set(r.id,r));
 loc.forEach(l=>{const r=by.get(l.id);if(ok&&!l.synced&&!r)syncFlight(l).then(()=>{ui();renderLog()});by.set(l.id,{...(r||{}),...l,synced:!!(l.synced||r)})});
 Q.flights=Array.from(by.values()).sort((a,b)=>b.createdAt-a.createdAt);ui();renderLog()}
async function withGpx(rec){if(rec.gpx)return rec;const{data,error}=await sb.storage.from("documents").download(rec.filePath);if(error)throw error;rec.gpx=rec.filePath.endsWith(".gz")?await gunzip(data):await data.text();return rec}
async function delFlight(rec){
 if(rec.synced||rec.filePath){const{data,error}=await sb.from("flights").delete().eq("id",rec.id).select("id");if(error)throw error;if(!data||!data.length)throw new Error("Bu kaydı silme yetkiniz yok.");
  if(rec.filePath)await sb.storage.from("documents").remove([rec.filePath])}
 await dbDel("flights",rec.id)}

/* ---------- KML ---------- */
function parseKml(text){const doc=new DOMParser().parseFromString(text,"application/xml");if(doc.querySelector("parsererror"))throw new Error("Geçersiz KML dosyası (KMZ ise önce KML olarak dışa aktarın)");
 const ns=(el,t)=>Array.from(el.getElementsByTagNameNS("*",t));const tx1=(el,t)=>{const n=ns(el,t)[0];return n&&n.textContent?n.textContent.trim():""};
 const plain=h=>new DOMParser().parseFromString(String(h).replace(/<br\s*\/?>/gi,"\n"),"text/html").body.textContent.trim();
 const co=el=>{const c=ns(el,"coordinates")[0];return c?parseCoords(c.textContent):[]};
 const out={polygons:[],lines:[],points:[]};let n=0;
 for(const pm of ns(doc,"Placemark")){const meta={name:tx1(pm,"name")||"(adsız)",description:plain(tx1(pm,"description"))};
  for(const pg of ns(pm,"Polygon")){const ob=ns(pg,"outerBoundaryIs")[0];const outer=ob?co(ob):[];if(outer.length>=3)out.polygons.push({id:"pg"+n++,...meta,outer,holes:ns(pg,"innerBoundaryIs").map(co).filter(h=>h.length>=3)})}
  for(const ls of ns(pm,"LineString")){const path=co(ls);if(path.length>=2)out.lines.push({id:"ln"+n++,...meta,path})}
  for(const pt of ns(pm,"Point")){const pos=co(pt)[0];if(pos)out.points.push({id:"pt"+n++,...meta,pos})}}
 return out}
function kmlBounds(k){let a=90,b=-90,c=180,d=-180;const add=q=>{a=Math.min(a,q[0]);b=Math.max(b,q[0]);c=Math.min(c,q[1]);d=Math.max(d,q[1])};
 k.polygons.forEach(p=>p.outer.forEach(add));k.lines.forEach(l=>l.path.forEach(add));k.points.forEach(p=>add(p.pos));return{minLat:a,maxLat:b,minLon:c,maxLon:d}}
function setKml(k,name){Q.kml=k;Q.kmlName=name;checkFence();if(Q.map)Q.map.redraw();ui()}
async function loadKmlRemote(){const p=S.company&&S.company.kml_path;
 if(!p){if(Q.kmlName)setKml({polygons:[],lines:[],points:[]},"");return}
 const c=await dbGet("meta","kml");let text=c&&c.path===p?c.text:null;
 if(!text){try{const{data,error}=await sb.storage.from("documents").download(p);if(error)throw error;text=await data.text();await dbPut("meta",{key:"kml",path:p,text})}catch(e){if(c&&c.text)text=c.text;else throw e}}
 setKml(parseKml(text),"NOTAM KML (şirket)")}
async function loadKml(inp){const f=inp.files&&inp.files[0];inp.value="";if(!f)return;if(!isAdmin()){note("NOTAM KML dosyasını yalnızca yönetici yükleyebilir.");return}
 if(f.size>8e6){note("KML dosyası çok büyük (en fazla 8 MB).");return}
 try{const text=await f.text();const k=parseKml(text);if(!k.polygons.length&&!k.lines.length&&!k.points.length){note("KML içinde poligon, hat veya nokta bulunamadı.");return}
  const path=`${S.co}/kml/${uuid()}.kml`;const up=await sb.storage.from("documents").upload(path,new Blob([text],{type:"application/vnd.google-earth.kml+xml"}),{contentType:"application/vnd.google-earth.kml+xml"});if(up.error)throw up.error;
  const old=S.company.kml_path;const u2=await sb.from("companies").update({kml_path:path}).eq("id",S.co);if(u2.error)throw u2.error;
  S.company.kml_path=path;if(old)sb.storage.from("documents").remove([old]).catch(()=>{});await dbPut("meta",{key:"kml",path,text});
  setKml(k,f.name);if(Q.map)Q.map.fit(kmlBounds(k));note(`${f.name}: ${k.polygons.length} saha, ${k.lines.length} hat, ${k.points.length} nokta yüklendi ve tüm cihazlara dağıtıldı.`)}
 catch(e){note(e.message?errMsg(e):"KML okunamadı.")}}
async function clearKml(){if(!isAdmin())return;try{const old=S.company.kml_path;const u=await sb.from("companies").update({kml_path:null}).eq("id",S.co);if(u.error)throw u.error;S.company.kml_path=null;if(old)sb.storage.from("documents").remove([old]).catch(()=>{});await dbDel("meta","kml");setKml({polygons:[],lines:[],points:[]},"")}catch(e){note("Silinemedi: "+errMsg(e))}}

/* ---------- geofence (NOTAM): clear | near | inside ---------- */
function checkFence(){const f=Q.fix;if(!f){Q.fence={level:"clear"};return}const p=[f.lat,f.lon];let hit=null,near=null;
 for(const pg of Q.kml.polygons){if(pointInPolygon(p,pg)){hit=pg;break}let d=distToRingEdge(p,pg.outer);pg.holes.forEach(h=>{d=Math.min(d,distToRingEdge(p,h))});if(d<WARN_M&&(!near||d<near.d))near={pg,d}}
 const nx=hit?{level:"inside",zone:hit}:near?{level:"near",zone:near.pg,distance:Math.round(near.d)}:{level:"clear"};
 const key=nx.level+":"+(nx.zone?nx.zone.id:"");if(key!==Q.fenceKey){Q.fenceKey=key;if(nx.level!=="clear"&&navigator.vibrate){try{navigator.vibrate([300,100,300])}catch(e){}}}Q.fence=nx}

/* ---------- konum ---------- */
function geoMsg(e){return e&&e.code===1?"Konum izni verilmedi veya bu pencerede engelli. Tarayıcı/uygulama ayarlarından konuma izin verin. Gömülü pencerede engellenirse aşağıdaki Test konumunu kullanabilirsiniz.":e&&e.code===3?"Konum zaman aşımına uğradı, GPS sinyali bekleniyor.":"Konum alınamıyor (GPS sinyali yok veya cihaz desteklemiyor)."}
/* Yerel (Capacitor) uygulamada arka plan konumu: eklenti varsa onu kullan, yoksa tarayıcı konumu */
const BG=(()=>{try{const C=window.Capacitor;if(C&&C.isNativePlatform&&C.isNativePlatform())return C.registerPlugin("BackgroundGeolocation")}catch(e){}return null})();
function toPos(l){return{coords:{latitude:l.latitude,longitude:l.longitude,altitude:l.altitude,speed:l.speed,heading:l.bearing,accuracy:l.accuracy},timestamp:l.time||Date.now()}}
function startGeo(bg){if(Q.sim||Q.watch!=null)return;
 if(BG){const gen=Q.wgen=(Q.wgen||0)+1;const opts={requestPermissions:true,stale:false,distanceFilter:0};if(bg){opts.backgroundTitle="AeroDoX uçuş kaydı";opts.backgroundMessage="Uçuş kaydı sürüyor. Konum arka planda alınıyor."}
  BG.addWatcher(opts,(loc,err)=>{if(err){Q.err=err.code==="NOT_AUTHORIZED"?"Konum izni verilmedi. Ayarlar > Uygulamalar > AeroDoX > İzinler > Konum > Her zaman izin ver.":"Konum alınamıyor.";ui();return}if(loc)onPos(toPos(loc))}).then(id=>{if(gen!==Q.wgen||Q.sim)BG.removeWatcher({id}).catch(()=>{});else Q.watch=id}).catch(e=>{Q.err="Konum başlatılamadı: "+errMsg(e);ui()});Q.watch="pending";return}
 if(!navigator.geolocation){Q.err="Bu cihaz/tarayıcı konum desteklemiyor. Test konumunu kullanabilirsiniz.";ui();return}
 try{Q.watch=navigator.geolocation.watchPosition(onPos,e=>{Q.err=geoMsg(e);ui()},{enableHighAccuracy:true,maximumAge:0,timeout:20000})}catch(e){Q.err=geoMsg(e);ui()}}
function stopGeo(){Q.wgen=(Q.wgen||0)+1;if(Q.watch==null)return;if(BG){if(Q.watch!=="pending")BG.removeWatcher({id:Q.watch}).catch(()=>{})}else if(navigator.geolocation)navigator.geolocation.clearWatch(Q.watch);Q.watch=null}
function restartGeo(bg){if(Q.sim)return;stopGeo();startGeo(bg)}
function onPos(pos){Q.raw=pos;const c=pos.coords;
 if(BG&&Q.status==="running"&&!Q.sim){const lp=Q.pts.length?Q.pts[Q.pts.length-1]:null;if(!lp||pos.timestamp-lp.ts>=900){const p=makePoint(pos,lp);Q.pts.push(p);Q.cur=p}}
Q.fix={lat:c.latitude,lon:c.longitude,acc:c.accuracy,heading:c.heading,speed:c.speed,alt:c.altitude,ts:pos.timestamp};Q.err="";
 if(Q.status!=="running")Q.cur=Q.prevP=makePoint(pos,Q.prevP);
 checkFence();if(Q.map){if(!Q.centered){Q.centered=true;Q.map.setView(Q.fix.lat,Q.fix.lon,14)}else if(Q.follow)Q.map.center(Q.fix.lat,Q.fix.lon);Q.map.redraw()}ui()}
/* Test konumu: sahte bir uçuş üretir; kayıtlar "Test" olarak işaretlenir */
function startSim(){stopSim();const s={lat:38.6431,lon:34.8289,hdg:80,t:0};const step=()=>{s.t++;s.hdg=((s.hdg+Math.sin(s.t/30)*3)%360+360)%360;const spd=3+2*Math.sin(s.t/45);
 s.lat+=spd*Math.cos(rad(s.hdg))/111320;s.lon+=spd*Math.sin(rad(s.hdg))/(111320*Math.cos(rad(s.lat)));
 onPos({coords:{latitude:s.lat,longitude:s.lon,altitude:1050+150*Math.sin(s.t/40),speed:spd,heading:s.hdg,accuracy:5},timestamp:Date.now()})};step();Q.simT=setInterval(step,1000)}
function stopSim(){clearInterval(Q.simT);Q.simT=null}
function setSim(on){if(Q.status==="running"){note("Uçuş sürerken test konumu değiştirilemez.");ui();return}Q.sim=on;Q.fix=null;Q.raw=null;Q.cur=Q.prevP=null;Q.centered=false;Q.err="";
 if(on){stopGeo();startSim()}else{stopSim();startGeo()}ui()}

/* ---------- oturum: Start / Stop ---------- */
const elapsed=()=>Q.status==="running"?Q.now-Q.t0:Q.status==="stopped"?Q.t1-Q.t0:0;
async function wakeOn(){try{if(navigator.wakeLock)Q.wake=await navigator.wakeLock.request("screen")}catch(e){}}
function start(){if(Q.status==="running")return;if(!Q.fix){note("Henüz konum alınamadı. Konum iznini verin ve GPS sinyalini bekleyin.");return}
 Q.pts=[];Q.cur=null;Q.prevP=null;Q.last=null;Q.t0=Date.now();Q.now=Q.t0;Q.status="running";Q.follow=true;Q.fenceKey="";checkFence();wakeOn();restartGeo(true);
 Q.timer=setInterval(tick,1000);if(Q.map){Q.map.center(Q.fix.lat,Q.fix.lon);Q.map.redraw()}ui()}
function tick(){const now=Date.now(),raw=Q.raw;Q.now=now;const lastP=Q.pts.length?Q.pts[Q.pts.length-1]:null;if(raw&&now-raw.timestamp<=FIX_MAX_AGE&&!(lastP&&now-lastP.ts<900)){const p=makePoint({coords:raw.coords,timestamp:now},Q.pts.length?Q.pts[Q.pts.length-1]:null);Q.pts.push(p);Q.cur=p}
 if(Q.map)Q.map.redraw();ui()}
async function stop(){if(Q.status!=="running")return;clearInterval(Q.timer);try{if(Q.wake)await Q.wake.release()}catch(e){}Q.wake=null;Q.t1=Date.now();Q.status="stopped";Q.follow=false;restartGeo(false);
 const pts=Q.pts;if(pts.length<2){note("Uçuş çok kısa: kaydedilecek yeterli veri yok (en az 2 nokta).");ui();return}
 const name=flightFileName(new Date(Q.t0)),rec={id:(crypto.randomUUID?crypto.randomUUID():String(Q.t0)+Math.random().toString(16).slice(2)),name,createdAt:Q.t0,startedAt:Q.t0,endedAt:Q.t1,...flightStats(pts),pointCount:pts.length,sim:Q.sim,pilotName:pilotName(),gpx:buildGpx(pts,{name,startedAt:Q.t0,sim:Q.sim})};
 await dbPut("flights",rec);Q.last=rec;ui();await syncFlight(rec);await refreshFlights()}

/* ---------- paylaşım / indirme ---------- */
async function nativeShare(rec){const P=window.Capacitor.Plugins,r=await P.Filesystem.writeFile({path:rec.name,data:rec.gpx,directory:"CACHE",encoding:"utf8"});await P.Share.share({title:rec.name,text:"Balon uçuş kaydı (GPX)",url:r.uri,dialogTitle:"GPX dosyasını paylaş / kaydet"})}
async function saveGpx(rec){try{rec=await withGpx(rec);if(BG){await nativeShare(rec);return}const url=URL.createObjectURL(new Blob([rec.gpx],{type:"application/gpx+xml"}));const a=document.createElement("a");a.href=url;a.download=rec.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);note("GPX indirildi: "+rec.name)}catch(e){note("Dosya kaydedilemedi: "+errMsg(e))}}
async function share(rec){try{rec=await withGpx(rec)}catch(e){note("GPX dosyası alınamadı: "+errMsg(e));return}
 if(BG){try{await nativeShare(rec)}catch(e){if(!/cancel/i.test(errMsg(e)))note("Paylaşılamadı: "+errMsg(e))}return}
 for(const type of["application/gpx+xml","application/octet-stream","text/plain"]){try{const f=new File([rec.gpx],rec.name,{type});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:rec.name,text:"Balon uçuş kaydı (GPX)"});return}}catch(e){if(e&&e.name==="AbortError")return}}
 note("Bu cihaz paylaşımı desteklemiyor, dosya indiriliyor.");await saveGpx(rec)}

/* ---------- uyarı notu ---------- */
function note(m,ms){Q.note=m;clearTimeout(Q.noteT);Q.noteT=setTimeout(()=>{Q.note="";ui()},ms||6000);ui()}

/* ---------- harita (kütüphanesiz, canvas): uydu karoları + KML + rota + konum ---------- */
function createMap(host,cb){
 const cv=document.createElement("canvas");host.appendChild(cv);const ctx=cv.getContext("2d");
 const pop=document.createElement("div");pop.className="fl-pop";pop.hidden=true;host.appendChild(pop);
 const V={lat:38.65,lon:34.83,z:10,w:0,h:0,dpr:1},tiles=new Map();let raf=0,pfit=null,tOk=0,tErr=0;
 const MX=(lo,z)=>(lo+180)/360*256*2**z;
 const MY=(la,z)=>{const s=Math.sin(Math.max(-85.05,Math.min(85.05,la))*Math.PI/180);return(0.5-Math.log((1+s)/(1-s))/(4*Math.PI))*256*2**z};
 const LON=(x,z)=>x/(256*2**z)*360-180;
 const LAT=(y,z)=>180/Math.PI*Math.atan(Math.sinh(Math.PI-2*Math.PI*y/(256*2**z)));
 const org=()=>[MX(V.lon,V.z)-V.w/2,MY(V.lat,V.z)-V.h/2];
 const req=()=>{if(!raf)raf=requestAnimationFrame(draw)};
 function tile(z,x,y){const k=z+"/"+x+"/"+y;let t=tiles.get(k);if(!t){t=new Image();t.decoding="async";t.onload=()=>{t.ok=1;tOk++;req()};t.onerror=()=>{t.bad=1;tErr++;req()};t.src=TILE.replace("{z}",z).replace("{y}",y).replace("{x}",x);tiles.set(k,t);if(tiles.size>500)tiles.delete(tiles.keys().next().value)}return t}
 function draw(){raf=0;if(!V.w)return;const c=ctx,Qs=cb.state();c.setTransform(V.dpr,0,0,V.dpr,0,0);c.fillStyle="#0b1118";c.fillRect(0,0,V.w,V.h);
  const[ox,oy]=org(),tz=Math.max(0,Math.min(19,Math.round(V.z))),sz=256*2**(V.z-tz),n=2**tz;
  const x0=Math.floor(ox/sz),x1=Math.floor((ox+V.w)/sz),y0=Math.max(0,Math.floor(oy/sz)),y1=Math.min(n-1,Math.floor((oy+V.h)/sz));
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const im=tile(tz,((tx%n)+n)%n,ty);if(im.ok)c.drawImage(im,Math.round(tx*sz-ox),Math.round(ty*sz-oy),Math.ceil(sz)+1,Math.ceil(sz)+1)}
  const P=q=>[MX(q[1],V.z)-ox,MY(q[0],V.z)-oy],ring=r=>r.forEach((q,i)=>{const p=P(q);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});
  c.lineJoin="round";c.lineCap="round";
  for(const pg of Qs.kml.polygons){c.beginPath();ring(pg.outer);c.closePath();pg.holes.forEach(h=>{ring(h);c.closePath()});c.fillStyle="rgba(255,90,77,.25)";c.fill("evenodd");c.strokeStyle="rgba(255,90,77,.95)";c.lineWidth=2;c.stroke()}
  for(const l of Qs.kml.lines){c.beginPath();ring(l.path);c.strokeStyle="rgba(77,171,247,.9)";c.lineWidth=3;c.stroke()}
  c.font="12px system-ui,sans-serif";
  for(const p of Qs.kml.points){const q=P(p.pos);c.beginPath();c.arc(q[0],q[1],6,0,6.2832);c.fillStyle="rgba(240,140,0,.9)";c.fill();c.strokeStyle="#fff";c.lineWidth=2;c.stroke();if(V.z>=12){c.lineWidth=3;c.strokeStyle="rgba(0,0,0,.7)";c.strokeText(p.name,q[0]+9,q[1]+4);c.fillStyle="#fff";c.fillText(p.name,q[0]+9,q[1]+4)}}
  if(Qs.pts.length>1){c.beginPath();Qs.pts.forEach((p,i)=>{const q=P([p.lat,p.lon]);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])});c.strokeStyle="#ffb000";c.lineWidth=4;c.stroke()}
  const f=Qs.fix;if(f){const q=P([f.lat,f.lon]),mpp=156543.03392*Math.cos(rad(f.lat))/2**V.z,ar=(f.acc||0)/mpp;
   if(ar>14){c.beginPath();c.arc(q[0],q[1],ar,0,6.2832);c.fillStyle="rgba(255,176,0,.12)";c.fill()}
   c.beginPath();c.arc(q[0],q[1],14,0,6.2832);c.fillStyle="rgba(255,176,0,.35)";c.fill();
   if(f.heading!=null&&isFinite(f.heading)&&(f.speed||0)>0.5){c.save();c.translate(q[0],q[1]);c.rotate(rad(f.heading));c.beginPath();c.moveTo(0,-20);c.lineTo(6,-10);c.lineTo(-6,-10);c.closePath();c.fillStyle="#ffb000";c.fill();c.restore()}
   c.beginPath();c.arc(q[0],q[1],8,0,6.2832);c.fillStyle="#ffb000";c.fill();c.strokeStyle="#fff";c.lineWidth=3;c.stroke()}
  c.font="10px system-ui,sans-serif";c.textAlign="right";c.fillStyle="rgba(255,255,255,.75)";c.fillText("Esri, Maxar, Earthstar Geographics",V.w-6,V.h-5);c.textAlign="left";
  if(tErr>=4&&tOk===0){c.fillStyle="rgba(11,17,24,.85)";c.fillRect(0,V.h/2-24,V.w,48);c.fillStyle="#ffb000";c.font="13px system-ui,sans-serif";c.textAlign="center";c.fillText("Uydu görüntüsü yüklenemedi (internet veya erişim izni)",V.w/2,V.h/2+4);c.textAlign="left"}}
 function hide(){pop.hidden=true}
 function show(it,sx,sy){if(!it){hide();return}pop.textContent="";const x=document.createElement("button");x.textContent="✕";x.setAttribute("aria-label","Kapat");x.onclick=hide;const b=document.createElement("b");b.textContent=it.name;pop.append(x,b);
  if(it.description){const d=document.createElement("div");d.style.whiteSpace="pre-wrap";d.textContent=it.description;pop.append(d)}pop.hidden=false;
  pop.style.left=Math.max(8,Math.min(V.w-pop.offsetWidth-8,sx-pop.offsetWidth/2))+"px";const top=sy+16+pop.offsetHeight>V.h?sy-pop.offsetHeight-16:sy+16;pop.style.top=Math.max(8,top)+"px"}
 function tap(sx,sy){const[ox,oy]=org(),Qs=cb.state(),P=q=>[MX(q[1],V.z)-ox,MY(q[0],V.z)-oy];let hit=null;
  for(const p of Qs.kml.points){const q=P(p.pos);if(Math.hypot(q[0]-sx,q[1]-sy)<18){hit=p;break}}
  if(!hit)for(const l of Qs.kml.lines){let m=1e9;for(let i=1;i<l.path.length;i++){const a=P(l.path[i-1]),b=P(l.path[i]);m=Math.min(m,distSeg(sx,sy,a[0],a[1],b[0],b[1]))}if(m<14){hit=l;break}}
  if(!hit){const q=[LAT(oy+sy,V.z),LON(ox+sx,V.z)];for(const pg of Qs.kml.polygons)if(pointInPolygon(q,pg)){hit=pg;break}}show(hit,sx,sy)}
 function panBy(dx,dy){V.lon=LON(MX(V.lon,V.z)-dx,V.z);V.lat=Math.max(-85,Math.min(85,LAT(MY(V.lat,V.z)-dy,V.z)));req()}
 function zoomAt(sx,sy,nz){nz=Math.max(3,Math.min(19,nz));const[ox,oy]=org(),lo=LON(ox+sx,V.z),la=LAT(oy+sy,V.z);V.z=nz;V.lon=LON(MX(lo,nz)-sx+V.w/2,nz);V.lat=Math.max(-85,Math.min(85,LAT(MY(la,nz)-sy+V.h/2,nz)));req()}
 const ptr=new Map();let st=null,pd=0;
 const loc=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
 cv.addEventListener("pointerdown",e=>{try{cv.setPointerCapture(e.pointerId)}catch(_){}const l=loc(e);ptr.set(e.pointerId,{x:l[0],y:l[1]});if(ptr.size===1)st={x:l[0],y:l[1],moved:false,t:Date.now()};else{if(st)st.moved=true;const a=Array.from(ptr.values());pd=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}});
 cv.addEventListener("pointermove",e=>{const p=ptr.get(e.pointerId);if(!p)return;const l=loc(e);
  if(ptr.size===1){if(!st.moved){if(Math.hypot(l[0]-st.x,l[1]-st.y)<6)return;st.moved=true;hide();if(cb.state().follow)cb.onBreak()}panBy(l[0]-p.x,l[1]-p.y);p.x=l[0];p.y=l[1]}
  else if(ptr.size===2){p.x=l[0];p.y=l[1];const a=Array.from(ptr.values()),d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pd>0&&d>0){const fol=cb.state().follow;zoomAt(fol?V.w/2:(a[0].x+a[1].x)/2,fol?V.h/2:(a[0].y+a[1].y)/2,V.z+Math.log2(d/pd))}pd=d}});
 const up=e=>{if(!ptr.has(e.pointerId))return;ptr.delete(e.pointerId);if(ptr.size===0&&st&&!st.moved&&e.type==="pointerup"&&Date.now()-st.t<600)tap(st.x,st.y);if(ptr.size<2)pd=0};
 cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
 cv.addEventListener("wheel",e=>{e.preventDefault();const l=loc(e),fol=cb.state().follow;zoomAt(fol?V.w/2:l[0],fol?V.h/2:l[1],V.z-Math.sign(e.deltaY)*0.5)},{passive:false});
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;V.dpr=Math.min(2,window.devicePixelRatio||1);V.w=w;V.h=h;cv.width=Math.round(w*V.dpr);cv.height=Math.round(h*V.dpr);if(pfit){const b=pfit;pfit=null;fit(b)}req()}
 function fit(b){if(!V.w){pfit=b;return}const dx=MX(b.maxLon,0)-MX(b.minLon,0),dy=MY(b.minLat,0)-MY(b.maxLat,0);let z=16;if(dx>0||dy>0)z=Math.log2(Math.min(dx>0?V.w*0.85/dx:1e9,dy>0?V.h*0.85/dy:1e9));
  V.z=Math.max(3,Math.min(16,z));V.lon=(b.minLon+b.maxLon)/2;V.lat=LAT((MY(b.minLat,V.z)+MY(b.maxLat,V.z))/2,V.z);hide();req()}
 let ro=null;if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe(host)}else window.addEventListener("resize",resize);
 return{resize,redraw:req,fit,setView(la,lo,z){V.lat=la;V.lon=lo;V.z=z;req()},center(la,lo){V.lat=la;V.lon=lo;req()},zoomBy(d){zoomAt(V.w/2,V.h/2,V.z+d)},destroy(){if(ro)ro.disconnect();cancelAnimationFrame(raf)}}}

/* ---------- arayüz ---------- */
function build(){const r=document.createElement("div");r.className="fl";
 r.innerHTML=`<div class="fl-tabs"><button data-act="sub" data-v="map" class="on">🗺️ Harita</button><button data-act="sub" data-v="log">📁 Kayıtlar<span class="fl-cnt"></span></button></div>
<div class="fl-pane fl-p-map">
 <div class="fl-bar"><div class="fl-timer">00:00:00</div><button class="fl-go" data-act="go">Start</button></div>
 <div class="fl-alerts"></div>
 <div class="fl-mapwrap"><button class="fl-rc" data-act="rc" hidden>Merkeze al</button><div class="fl-zoom"><button data-act="zi" aria-label="Yakınlaştır">+</button><button data-act="zo" aria-label="Uzaklaştır">−</button></div></div>
 <div class="fl-pos mu"></div>
 <div class="fl-telem"><div><b class="t-alt">–</b><span>Yükseklik m</span></div><div><b class="t-gs">–</b><span>Yer hızı km/sa</span></div><div><b class="t-vs">–</b><span>Dikey hız m/s</span></div><div><b class="t-wd">–</b><span>Rüzgar yön° / km/sa</span></div></div>
 <div class="fl-kml"><label class="fl-file" ${isAdmin()?"":"hidden"}>📍 NOTAM KML yükle<input type="file" class="fl-kfile" accept=".kml,.xml,application/vnd.google-earth.kml+xml,application/xml,text/xml"></label><span class="fl-kinfo mu"></span><button class="ghost" data-act="kfit" hidden>KML'ye git</button><button class="ghost" data-act="kclr" hidden>Temizle</button><label class="fl-simlbl"><input type="checkbox" class="fl-sim"> Test konumu (simülasyon)</label></div>
</div>
<div class="fl-pane fl-p-log" hidden><div class="fl-list"></div></div>`;
 Q.root=r;Q.map=createMap(r.querySelector(".fl-mapwrap"),{state:()=>Q,onBreak:()=>{Q.follow=false;ui()}});
 r.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b||!r.contains(b))return;const a=b.dataset.act,id=b.dataset.id,rec=Q.flights.find(x=>x.id===id)||(Q.last&&Q.last.id===id?Q.last:null);
  if(a==="sub"){Q.sub=b.dataset.v;showSub()}else if(a==="go"){Q.status==="running"?stop():start()}
  else if(a==="rc"){Q.follow=true;if(Q.fix)Q.map.center(Q.fix.lat,Q.fix.lon);ui()}else if(a==="zi")Q.map.zoomBy(1);else if(a==="zo")Q.map.zoomBy(-1);
  else if(a==="kfit"){if(Q.kml.polygons.length+Q.kml.lines.length+Q.kml.points.length){Q.follow=false;Q.map.fit(kmlBounds(Q.kml));ui()}}else if(a==="kclr")clearKml();
  else if(a==="share"&&rec)share(rec);else if(a==="dl"&&rec)saveGpx(rec);else if(a==="dismiss"){Q.last=null;ui()}
  else if(a==="del"&&rec){if(Q.confirmId===id){clearTimeout(Q.confirmT);Q.confirmId=null;delFlight(rec).then(refreshFlights,e=>note("Silinemedi: "+errMsg(e)))}else{Q.confirmId=id;clearTimeout(Q.confirmT);Q.confirmT=setTimeout(()=>{Q.confirmId=null;renderLog()},4000);renderLog()}}});
 r.addEventListener("change",e=>{if(e.target.matches(".fl-sim"))setSim(e.target.checked);else if(e.target.matches(".fl-kfile"))loadKml(e.target)})}
function showSub(){if(!Q.root)return;Q.root.querySelector(".fl-p-map").hidden=Q.sub!=="map";Q.root.querySelector(".fl-p-log").hidden=Q.sub!=="log";Q.root.querySelectorAll(".fl-tabs button").forEach(b=>b.classList.toggle("on",b.dataset.v===Q.sub));if(Q.sub==="log")renderLog();else if(Q.map)Q.map.resize()}
function ui(){const r=Q.root;if(!r||!r.isConnected)return;const T=(s,v)=>{const el=r.querySelector(s);if(el&&el.textContent!==v)el.textContent=v};const run=Q.status==="running",c=Q.cur,f=(v,d)=>v==null||!isFinite(v)?"–":v.toFixed(d||0);
 T(".fl-timer",fmtDur(elapsed()));const go=r.querySelector(".fl-go");go.textContent=run?"Stop":"Start";go.classList.toggle("stop",run);
 T(".t-alt",c?f(c.ele):"–");T(".t-gs",c?f(c.gs*3.6,1):"–");T(".t-vs",c&&run?(c.vs>0?"+":"")+f(c.vs,1):"–");T(".t-wd",c&&c.windFrom!=null?Math.round(c.windFrom)+"° / "+f(c.windSpeed*3.6,0):"–");
 const fx=Q.fix;T(".fl-pos",fx?`${fx.lat.toFixed(5)}, ${fx.lon.toFixed(5)} · ±${Math.round(fx.acc||0)} m${Q.sim?" · TEST KONUMU":""} · Baro yükseklik: tarayıcıda yok, GPS kullanılıyor`:Q.sim?"Test konumu bekleniyor…":"Konum bekleniyor…");
 r.querySelector(".fl-rc").hidden=!(run&&!Q.follow);r.querySelector(".fl-sim").checked=Q.sim;r.querySelector(".fl-sim").disabled=run;
 const k=Q.kml,kn=k.polygons.length+k.lines.length+k.points.length;T(".fl-kinfo",kn?`${Q.kmlName} · ${k.polygons.length} saha, ${k.lines.length} hat, ${k.points.length} nokta`:(isAdmin()?"KML yüklenmedi (KMZ desteklenmez)":"NOTAM KML yüklenmedi (yönetici yükler)"));
 r.querySelector('[data-act="kfit"]').hidden=!kn;r.querySelector('[data-act="kclr"]').hidden=!kn||!isAdmin();T(".fl-cnt",Q.flights.length?" ("+Q.flights.length+")":"");
 let h="";if(Q.err)h+=`<div class="fl-al warn">${esc(Q.err)}</div>`;
 if(Q.fence.level==="inside")h+=`<div class="fl-al bad">⚠ NOTAM sahası içindesin: ${esc(Q.fence.zone.name)}</div>`;else if(Q.fence.level==="near")h+=`<div class="fl-al warn">⚠ ${esc(Q.fence.zone.name)} sınırına ${Q.fence.distance} m kaldı</div>`;
 if(Q.note)h+=`<div class="fl-al info">${esc(Q.note)}</div>`;
 if(Q.last&&!run)h+=`<div class="fl-al ok"><span>Kaydedildi: ${esc(Q.last.name)}</span><span><button data-act="share" data-id="${esc(Q.last.id)}">Paylaş</button> <button data-act="dl" data-id="${esc(Q.last.id)}">İndir</button> <button data-act="dismiss">✕</button></span></div>`;
 if(h!==Q.alHtml){Q.alHtml=h;r.querySelector(".fl-alerts").innerHTML=h}}
function renderLog(){const r=Q.root;if(!r||!r.isConnected||Q.sub!=="log")return;const el=r.querySelector(".fl-list");let h=Q.persistent?"":`<div class="fl-al warn">Bu pencerede kalıcı depolama kullanılamıyor: kayıtlar yalnızca sayfa açıkken saklanır. GPX dosyalarını hemen paylaşın veya indirin.</div>`;
 h+=`<p class="mu">Kayıtlar ${RET_DAYS} gün sonra otomatik silinir. Kayıtlar önce cihaza, sonra sunucuya kaydedilir; şirketteki herkes birbirinin uçuşlarını görebilir.${Q.syncErr?` Senkron uyarısı: ${esc(Q.syncErr)}`:""}</p>`;
 if(!Q.flights.length)h+=`<p class="mu">Henüz kayıtlı uçuş yok. Harita sekmesinden Start ile uçuşu başlat.</p>`;
 for(const f of Q.flights){const left=Math.max(0,Math.ceil((f.createdAt+RET_DAYS*DAY-Date.now())/DAY)),d=new Date(f.startedAt);
  h+=`<div class="card"><div class="fl-rowh"><b>${esc(f.name)}</b><span>${f.sim?'<span class="badge wa">Test</span> ':""}<span class="badge ${f.synced?"ok":"wa"}">${f.synced?"Sunucuda":"Cihazda"}</span></span></div>
<div>${f.pilotName?esc(f.pilotName)+" · ":""}${d.toLocaleDateString("tr-TR")} · ${d.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</div>
<div class="mu">Süre ${fmtDur(f.durationSec*1000)} · Maks. yükseklik ${f.maxAlt==null?"–":Math.round(f.maxAlt)+" m"} · Mesafe ${(f.distanceM/1000).toFixed(1)} km · ${left} gün kaldı</div>
<div class="fl-acts"><button data-act="share" data-id="${esc(f.id)}">Paylaş</button><button class="ghost" data-act="dl" data-id="${esc(f.id)}">GPX indir</button>${canDel(f)?`<button class="ghost fl-del" data-act="del" data-id="${esc(f.id)}">${Q.confirmId===f.id?"Emin misin? Sil":"🗑 Sil"}</button>`:""}</div></div>`}
 el.innerHTML=h}

/* ---------- dış API ---------- */
function init(co){Q.co=co;dbp=null;mem.flights.clear();mem.meta.clear();Q.persistent=true;
 loadKmlRemote().catch(()=>{});
 Q.purgeT=setInterval(refreshFlights,6*36e5);Q.visH=()=>{if(document.visibilityState==="visible"){refreshFlights();if(Q.status==="running"&&!Q.wake)wakeOn()}};document.addEventListener("visibilitychange",Q.visH);refreshFlights()}
function mount(host,co){if(!host)return;if(Q.co&&Q.co!==co)reset();if(!Q.co)init(co);if(!Q.root)build();host.appendChild(Q.root);startGeo();showSub();ui();requestAnimationFrame(()=>{if(Q.map)Q.map.resize()})}
function reset(){stopGeo();stopSim();clearInterval(Q.timer);clearInterval(Q.purgeT);clearTimeout(Q.noteT);clearTimeout(Q.confirmT);if(Q.visH)document.removeEventListener("visibilitychange",Q.visH);if(Q.map)Q.map.destroy();if(Q.root)Q.root.remove();dbp=null;Object.assign(Q,fresh())}
function teardown(){if(!Q.co)return Promise.resolve();if(Q.status==="running")return stop().then(reset,reset);reset();return Promise.resolve()}
function armLogout(){if(Q.logoutArm)return true;Q.logoutArm=true;setTimeout(()=>{Q.logoutArm=false},8000);note("Uçuş kaydı sürüyor. Çıkış yaparsan uçuş durdurulup kaydedilir. Çıkmak için Çıkış'a tekrar bas.",8000);return false}
return{mount,teardown,running:()=>Q.status==="running",armLogout}
})();
