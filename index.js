const http = require('http');
const net = require('net');
let gps = { lat: 3.3616128, lng: 114.0850688, time: new Date().toISOString() };
let history = [{lat:3.3616128,lng:114.0850688,time:new Date().toISOString()}];

const tcp = net.createServer((sock) => {
  console.log('FMB910 connected');
  sock.on('data', (d) => {
    try {
      sock.write(Buffer.from([0x01]));
      if(d.length>50){
        let lat=d.readInt32BE(d.length-22)/1e7;
        let lng=d.readInt32BE(d.length-26)/1e7;
        if(Math.abs(lat)<=90 && Math.abs(lng)<=180 && lat!=0){
          gps={lat,lng,time:new Date().toISOString()};
          history.push(gps);
          if(history.length>200) history.shift();
          console.log('GPS:', lat, lng);
        }
      }
    } catch(e){}
  });
  sock.on('error', ()=>{});
});
tcp.on('error', e=>console.log('TCP',e.message));
tcp.listen(5000, '0.0.0.0', ()=>console.log('TCP 5000 ready'));

const PORT = process.env.PORT || 8080;
const web = http.createServer((req,res)=>{
  if(req.url=='/api'){
    res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
    res.end(JSON.stringify({lat:gps.lat,lng:gps.lng,time:gps.time,history:history}));
    return;
  }
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FMB910 LIVE</title><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script><style>body{margin:0;background:#111;color:#fff;font-family:sans-serif}#map{height:82vh}.top{padding:12px;background:#1e1e1e;border-bottom:3px solid #00ff88;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}.badge{background:#00ff88;color:#000;padding:4px 12px;border-radius:20px;font-weight:900}.info{background:#222;padding:10px;display:flex;gap:14px;flex-wrap:wrap;font-size:14px}.info b{color:#00ff88}</style></head><body><div class="top"><div>🛰️ <b>FMB910 LIVE TRACKER</b> <span class="badge">ONLINE</span></div><div id="clock"></div></div><div class="info"><div>Lat: <b id="lat">-</b></div><div>Lng: <b id="lng">-</b></div><div>Last: <span id="tm">-</span></div><div>Points: <b id="cnt">0</b></div><div><a id="gmaps" target="_blank" style="color:#00ff88">Open Google Maps</a></div></div><div id="map"></div><script>let map=L.map('map').setView([3.3616,114.0850],16);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);let mk=L.marker([3.3616,114.0850]).addTo(map).bindPopup('FMB910');let poly=L.polyline([],{color:'#00ff88',weight:5}).addTo(map);async function refresh(){let r=await fetch('/api');let d=await r.json();document.getElementById('lat').innerText=d.lat.toFixed(7);document.getElementById('lng').innerText=d.lng.toFixed(7);document.getElementById('tm').innerText=new Date(d.time).toLocaleString('id-ID');document.getElementById('cnt').innerText=d.history.length;document.getElementById('gmaps').href='https://maps.google.com/?q='+d.lat+','+d.lng;mk.setLatLng([d.lat,d.lng]);poly.setLatLngs(d.history.map(p=>[p.lat,p.lng]));map.panTo([d.lat,d.lng]);}setInterval(refresh,3000);refresh();setInterval(()=>document.getElementById('clock').innerText=new Date().toLocaleString('id-ID'),1000);<\/script></body></html>`);
});
web.listen(PORT, '0.0.0.0', ()=>console.log('WEB OK on '+PORT));