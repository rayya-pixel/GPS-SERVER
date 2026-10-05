const http = require('http');
const net = require('net');

let gps = { lat: -6.2088, lng: 106.8456, time: new Date().toISOString() };
let history = [];

const tcp = net.createServer((sock) => {
  console.log('FMB910 connected');
  sock.on('data', (data) => {
    try {
      sock.write(Buffer.from([0x01]));
      if(data.length > 50){
        let lat = data.readInt32BE(data.length - 22) / 10000000;
        let lng = data.readInt32BE(data.length - 26) / 10000000;
        if(Math.abs(lat)<=90 && Math.abs(lng)<=180 && lat!=0){
          gps = { lat: lat, lng: lng, time: new Date().toISOString() };
          history.push(gps);
          if(history.length>100) history.shift();
          console.log('GPS:', lat, lng);
        }
      }
    } catch(e){ console.log(e.message); }
  });
  sock.on('error', ()=>{});
});
tcp.listen(5000, () => console.log('TCP 5000 ready'));

const web = http.createServer((req, res) => {
  if(req.url === '/api'){
    res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
    res.end(JSON.stringify({lat:gps.lat, lng:gps.lng, time:gps.time, history:history}));
    return;
  }
  res.writeHead(200, {'Content-Type':'text/html'});
  res.end(`
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FMB910 LIVE</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>body{margin:0;font-family:sans-serif;background:#111;color:#fff}#map{height:80vh}.top{padding:12px;background:#1e1e1e;border-bottom:3px solid #00ff88;display:flex;justify-content:space-between}.badge{background:#00ff88;color:#000;padding:4px 10px;border-radius:20px;font-weight:900}.info{background:#222;padding:10px;display:flex;gap:12px;flex-wrap:wrap}.info b{color:#00ff88}a{color:#00ff88}</style>
</head><body>
<div class="top"><div>🛰️ <b>FMB910 TRACKER</b> <span class="badge">LIVE</span></div><div id="jam"></div></div>
<div class="info"><div>Lat: <b id="lat">-</b></div><div>Lng: <b id="lng">-</b></div><div>Update: <span id="tm">-</span></div><div>Track: <b id="jml">0</b></div><div><a id="gm" target="_blank">Google Maps</a></div></div>
<div id="map"></div>
<script>
let map=L.map('map').setView([-6.2088,106.8456],16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let mk=L.marker([-6.2088,106.8456]).addTo(map);
let pl=L.polyline([],{color:'#00ff88',weight:5}).addTo(map);
function load(){fetch('/api').then(r=>r.json()).then(d=>{
document.getElementById('lat').innerText=d.lat.toFixed(6);
document.getElementById('lng').innerText=d.lng.toFixed(6);
document.getElementById('tm').innerText=new Date(d.time).toLocaleString('id-ID');
document.getElementById('jml').innerText=d.history.length;
document.getElementById('gm').href='https://maps.google.com/?q='+d.lat+','+d.lng;
mk.setLatLng([d.lat,d.lng]); pl.setLatLngs(d.history.map(h=>[h.lat,h.lng])); map.panTo([d.lat,d.lng]);
});}
setInterval(load,3000); load();
setInterval(()=>{document.getElementById('jam').innerText=new Date().toLocaleTimeString('id-ID')},1000);
</script></body></html>
`);
});
web.listen(process.env.PORT || 3000, () => console.log('WEB ready'));
