const http = require('http');
const PORT = process.env.PORT || 3000;
console.log('START V10 PORT '+PORT);
const server = http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end('<h1>HELLO V10 HIDUP!</h1><p>'+new Date().toISOString()+'</p>');
});
server.listen(PORT,'0.0.0.0',()=>console.log('V10 LISTENING ON '+PORT));