import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const outDir = path.join(root, 'frontend/public/data');

const airportsRaw = JSON.parse(fs.readFileSync(path.join(root, 'bestairfares-prod.airports.json'), 'utf8'));
const iconsRaw = JSON.parse(fs.readFileSync(path.join(root, 'bestairfares-prod.icons.json'), 'utf8'));

const airports = [];
for (const row of airportsRaw) {
  const code = String(row.cityCode ?? '')
    .trim()
    .toUpperCase();
  if (code.length !== 3) {
    continue;
  }
  airports.push({
    code,
    city: String(row.cityName ?? '').trim(),
    name: String(row.airportName ?? '').trim(),
    country: String(row.countryCode ?? row.countryName ?? '').trim(),
    state: String(row.stateCode ?? '').trim(),
  });
}

airports.sort((a, b) => a.code.localeCompare(b.code));

const airlines = [];
const seen = new Set();
for (const row of iconsRaw) {
  const code = String(row.airline_code ?? '')
    .trim()
    .toUpperCase();
  const name = String(row.airline_name ?? '').trim();
  const image = String(row.image ?? '').trim();
  if (!code || !image || seen.has(code)) {
    continue;
  }
  seen.add(code);
  airlines.push({ code, name, image });
}

airlines.sort((a, b) => a.code.localeCompare(b.code));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'airports.json'), JSON.stringify(airports));
fs.writeFileSync(path.join(outDir, 'airlines.json'), JSON.stringify(airlines));
console.log(`Wrote ${airports.length} airports, ${airlines.length} airlines`);
