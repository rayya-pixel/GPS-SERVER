const http = require('http');
const PORT = process.env.PORT || 8080;
let gps = { lat: 3.3616128, lng: 114.0850688, time: new Date().toISOString() };
let history = [{lat:3.3616128,lng:114.0850688}];

const server = http.createServer((req,res)=>{
  if(req.url==='/api'){
    res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
    res.end(JSON.stringify({lat:gps.lat,lng:gps.lng,time:gps.time,history:history}));
    return;
  }
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end('<h1>GPS SERVER AKTIF</h1><p>Web OK di port '+PORT+'</p><p>GPS: 3.3616128, 114.0850688</p><p><a href="/api">Lihat API</a></p>');
});
server.listen(PORT,'0.0.0.0',()=>console.log('WEB OK on '+PORT));