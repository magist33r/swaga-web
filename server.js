const http = require('http');
const fs = require('fs');
const path = require('path');
const { GameDig } = require('gamedig');

const PORT = 3000;

const SERVERS = [
  { id: 'heavy',   host: '194.147.90.110', port: 2302 },
  { id: 'mid',     host: '185.189.255.113', port: 2602 },
  { id: 'vanilla', host: '194.147.90.110',  port: 2402 },
];

async function queryServer(server) {
  try {
    const state = await GameDig.query({
      type: 'dayz',
      host: server.host,
      port: server.port,
      maxAttempts: 2,
      socketTimeout: 3000,
    });
    return {
      id: server.id,
      online: true,
      players: state.players.length,
      maxPlayers: state.maxplayers,
      name: state.name,
    };
  } catch {
    return { id: server.id, online: false, players: 0, maxPlayers: 0 };
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/status') {
    res.setHeader('Content-Type', 'application/json');
    const results = await Promise.all(SERVERS.map(queryServer));
    res.end(JSON.stringify(results));
  } else if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`SWAGA status API running on port ${PORT}`);
});
