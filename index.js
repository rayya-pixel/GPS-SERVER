const http = require('http');
const PORT = process.env.PORT || 3000;
let gps = { lat: 3.3616128, lng: 114.0850688, time: new Date().toISOString() };
let history = [gps];

const server = http.createServer((req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  if(req.url==='/api'){
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify({lat:gps.lat,lng:gps.lng,time:gps.time,history:history}));
    return;
  }
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FMB910 LIVE</title><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script><style>body{margin:0;background:#111;color:#fff;font-family:sans-serif}#map{height:80vh}.top{padding:12px;background:#1e1e1e;border-bottom:3px solid #00ff88;display:flex;justify-content:space-between}.badge{background:#00ff88;color:#000;padding:4px 10px;border-radius:10px;font-weight:900}.info{background:#222;padding:8px;display:flex;gap:10px;flex-wrap:wrap;font-size:14px}</style></head><body><div class="top"><div>🛰️ FMB910 <span class="badge">ONLINE V7</span></div><div id="clock"></div></div><div class="info"><div>Lat:<b id="lat">3.3616</b></div><div>Lng:<b id="lng">114.0850</b></div><div id="tm"></div><div>Point:<b id="cnt">1</b></div><div><a id="gm" target="_blank" style="color:#0f8">Google Maps</a></div></div><div id="map"></div><script>let map=L.map('map').setView([3.3616,114.0850],16);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);let mk=L.marker([3.3616,114.0850]).addTo(map);let pl=L.polyline([[3.3616,114.0850]],{color:'#00ff88',weight:5}).addTo(map);async function load(){let r=await fetch('/api');let d=await r.json();document.getElementById('lat').innerText=d.lat.toFixed(7);document.getElementById('lng').innerText=d.lng.toFixed(7);document.getElementById('tm').innerText=new Date(d.time).toLocaleString('id-ID');document.getElementById('cnt').innerText=d.history.length;document.getElementById('gm').href='https://maps.google.com/?q='+d.lat+','+d.lng;mk.setLatLng([d.lat,d.lng]);pl.setLatLngs(d.history.map(h=>[h.lat,h.lng]));map.setView([d.lat,d.lng]);}setInterval(load,3000);load();setInterval(()=>document.getElementById('clock').innerText=new Date().toLocaleString('id-ID'),1000);<\/script></body></html>`);
});
server.listen(PORT,'0.0.0.0',()=>console.log('WEB V7 OK on '+PORT));