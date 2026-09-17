const https = require('https');

// Test Tel Aviv & Central Israel bounding box
const query = `[out:json][timeout:25];
(
  node["amenity"~"^(bar|pub|nightclub|restaurant|cafe)$"]["name"](32.0,34.7,32.2,34.9);
);
out center tags 500;`;

const postData = 'data=' + encodeURIComponent(query);

const options = {
  hostname: 'overpass-api.de',
  port: 443,
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'OpenBarsIsrael/1.0'
  }
};

console.log('Sending regional query...');
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`Success! Received ${json.elements?.length} places in Central Israel in 1 second.`);
    } catch(e) {
      console.log('Error:', e.message, data.slice(0, 200));
    }
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(postData);
req.end();
