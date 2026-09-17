const ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];

async function testHaifa() {
  const query = `
[out:json][timeout:30];
(
  node["amenity"~"^(restaurant|bar|pub|cafe|fast_food|nightclub|biergarten)$"]["name"](32.74,34.94,32.86,35.12);
  way["amenity"~"^(restaurant|bar|pub|cafe|fast_food|nightclub|biergarten)$"]["name"](32.74,34.94,32.86,35.12);
);
out center tags;
`;
  for (const endpoint of ENDPOINTS) {
    try {
      console.log('Trying', endpoint);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'OpenBarsIsrael/5.0'
        },
        body: 'data=' + encodeURIComponent(query)
      });
      if (!res.ok) {
        console.log('Response not ok:', res.status);
        continue;
      }
      const text = await res.text();
      if (text.startsWith('<')) {
        console.log('Received HTML instead of JSON');
        continue;
      }
      const json = JSON.parse(text);
      console.log('Haifa elements found:', json.elements ? json.elements.length : 0);
      if (json.elements && json.elements.length > 0) {
        console.log('Sample Haifa elements:', json.elements.slice(0, 10).map(e => e.tags.name));
        return json.elements;
      }
    } catch (e) {
      console.log('Error on', endpoint, e.message);
    }
  }
}
testHaifa().catch(console.error);
