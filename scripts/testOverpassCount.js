const https = require('https');

const query = `[out:json][timeout:30];
area["ISO3166-1"="IL"][admin_level=2]->.il;
(
  node["amenity"~"^(bar|pub|nightclub|biergarten|restaurant|cafe)$"](area.il);
  way["amenity"~"^(bar|pub|nightclub|biergarten|restaurant|cafe)$"](area.il);
);
out count;`;

const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Count result:', parsed);
    } catch(e) {
      console.log('Error parsing:', e.message, data.slice(0, 300));
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message);
});
