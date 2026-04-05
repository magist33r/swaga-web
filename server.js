const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const SERVERS = [
  { id: 'heavy',   bmId: '38425390' },
  { id: 'mid',     bmId: '34292881' },
  { id: 'vanilla', bmId: '38418023' },
];

async function queryServer(server) {
  try {
    const res = await fetch(`https://api.battlemetrics.com/servers/${server.bmId}`);
    const data = await res.json();
    const attr = data.data.attributes;
    return {
      id: server.id,
      online: attr.status === 'online',
      players: attr.players,
      maxPlayers: attr.maxPlayers,
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
