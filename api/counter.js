// api/counter.js — Vercel serverless function
// Proxies counterapi.dev with CORS headers so the browser can read it

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const response = await fetch('https://api.counterapi.dev/v1/tetotamagotchi/visits/up');
    const data = await response.json();
    res.status(200).json({ count: data.count });
  } catch {
    res.status(500).json({ error: 'counter unavailable' });
  }
}
