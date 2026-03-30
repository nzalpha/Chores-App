const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3333;

const server = http.createServer((req, res) => {
  // Serve the HTML file
  if (req.method === 'GET' && req.url === '/') {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // Proxy POST /api/messages → Anthropic API
  if (req.method === 'POST' && req.url === '/api/messages') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const apiKey = req.headers['x-api-key'];
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body),
        },
      };

      console.log('\n--- Outgoing request to Anthropic ---');
      console.log('Headers:', JSON.stringify({ ...options.headers, 'x-api-key': '***redacted***' }, null, 2));
      console.log('Body:', body);

      const proxy = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
          console.log('\n--- Anthropic response ---');
          console.log('Status:', apiRes.statusCode);
          console.log('Body:', data);
          res.writeHead(apiRes.statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(data);
        });
      });

      proxy.on('error', err => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });

      proxy.write(body);
      proxy.end();
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n  Claude API Tester running at http://localhost:${PORT}\n`);
});
