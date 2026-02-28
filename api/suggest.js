// api/suggest.js — Vercel serverless function
// Forwards suggestions to Discord via webhook (URL stored as env var)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { suggestion } = req.body ?? {};

  if (!suggestion || typeof suggestion !== 'string') {
    return res.status(400).json({ error: 'No suggestion provided' });
  }

  const text = suggestion.trim();

  if (text.length === 0)   return res.status(400).json({ error: 'Suggestion is empty' });
  if (text.length > 500)   return res.status(400).json({ error: 'Too long (max 500 chars)' });

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  try {
    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '💌 new suggestion',
          description: text,
          color: 0xFF6B9D,
          footer: { text: 'from ILoveKasaneTETO' },
        }],
      }),
    });

    if (!discordRes.ok) throw new Error(`Discord returned ${discordRes.status}`);

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to send to Discord' });
  }
}
