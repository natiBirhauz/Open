const https = require('https');

// Test fetching Kiryat Gat and Kiryat Malakhi and Ashkelon
const query = `[out:json][timeout:25];
(
  node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.609, 34.767); // Kiryat Gat
  node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:5000, 31.728, 34.743); // Kiryat Malakhi
  node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.668, 34.574); // Ashkelon
  node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.801, 34.644); // Ashdod
);
out center tags;`;

const postData = 'data=' + encodeURIComponent(query);

const options = {
  hostname: 'overpass-api.de',
  port: 443,
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'OpenBarsIsrael/2.0'
  }
};

console.log('Querying Southern Israeli Cities...');
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`Success! Found ${json.elements?.length} venues in Kiryat Gat, Kiryat Malakhi, Ashkelon, and Ashdod!`);
      const sample = json.elements.slice(0, 5).map(e => e.tags.name);
      console.log('Sample spots:', sample);
    } catch(e) {
      console.log('Error:', e.message, data.slice(0, 200));
    }
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(postData);
req.end();
