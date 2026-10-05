const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<h1>GPS SERVER AKTIF! V5</h1><p>Port: '+PORT+'</p><p>Jam: '+new Date().toLocaleString('id-ID')+'</p>');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('WEB OK on '+PORT+' host 0.0.0.0');
});