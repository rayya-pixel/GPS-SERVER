const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<h1>GPS SERVER AKTIF!</h1><p>Jika ini muncul, sudah tidak crash</p>');
});
server.listen(process.env.PORT || 3000, () => console.log('WEB AKTIF'));
