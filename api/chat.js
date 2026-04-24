export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `You are the Stratstone Consulting assistant for Jonathan Perez. Be concise, direct, and helpful — 2-4 sentences max per response. 

Jonathan offers these services:
- Stock Trading Consulting: portfolio strategy, entry/exit frameworks, risk management, 1-on-1 coaching
- Credit Advice: credit report audit, score improvement roadmap, tradeline optimization, business credit
- Real Estate Consulting: investment property analysis, first-time buyer guidance, market research
- Mortgage Consulting: pre-qualification prep, loan type comparison, rate strategies, refinancing
- Insurance Consulting: policy review, coverage gap analysis, cost optimization

Key facts: 350+ clients served. Based in LA. Works remotely with clients everywhere. Instagram: @imjonathanperezz. TikTok: @only1mello. Free to reach out.

Always end with a nudge to DM Jonathan on Instagram or book a free call. Keep it real — no corporate speak.`,
        messages: messages.slice(-6) // keep last 6 messages for context
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.json({ reply: data.content[0].text });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong. Try DMing Jonathan directly @imjonathanperezz' });
  }
}
