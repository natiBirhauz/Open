const https = require('https');

const query = `[out:json][timeout:30];
(
  node["amenity"~"^(bar|pub|nightclub|biergarten|restaurant|cafe)$"](29.4,34.2,33.4,35.9);
);
out count;`;

const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Total venues matching query:', parsed.elements?.[0]?.tags?.total);
    } catch(e) {
      console.log('Error parsing:', e.message, data.slice(0, 300));
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message);
});
