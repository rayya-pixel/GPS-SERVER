const http = require('http');
const PORT = process.env.PORT || 3000;
let gps = { lat: 3.3616128, lng: 114.0850688, time: new Date().toISOString() };
let history = [gps];

const server = http.createServer((req,res)=>{
  if(req.url==='/api'){
    res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
    res.end(JSON.stringify({lat:gps.lat,lng:gps.lng,time:gps.time,history:history}));
    return;
  }
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>FMB910</title><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script><style>body{margin:0;background:#111;color:#fff;font-family:sans-serif}#map{height:85vh}.top{padding:10px;background:#1e1e1e;border-bottom:3px solid #0f8}</style></head><body><div class="top">🛰️ FMB910 ONLINE - Last: 3.3616,114.0850</div><div id="map"></div><script>let m=L.map('map').setView([3.3616,114.0850],16);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(m);L.marker([3.3616,114.0850]).addTo(m);<\/script></body></html>`);
});
server.listen(PORT,'0.0.0.0',()=>console.log('WEB OK '+PORT));