// Vercel Serverless Function: /api/quote.js
// Securely proxies requests to the Gemini API without exposing GEMINI_API_KEY to the client bundle.

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback quote in case API key is not configured in Vercel environment
  const fallbackQuote = {
    quote: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    source: "static_server_fallback",
  };

  if (!apiKey) {
    return res.status(200).json({
      ...fallbackQuote,
      warning: "GEMINI_API_KEY environment variable is not configured on the server.",
    });
  }

  try {
    const prompt = `You are an elite discipline architect and stoic master.
Generate ONE punchy, intense, self-centric motivational quote focused on discipline, self-mastery, ruthless execution, and relentless consistency.
Avoid generic clichés. Make it razor-sharp and under 25 words.
Return ONLY valid JSON with this exact structure, nothing else:
{"quote": "...", "author": "..."}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 120,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", response.status, errorText);
      return res.status(200).json({
        ...fallbackQuote,
        warning: `Gemini API responded with status ${response.status}`,
      });
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return res.status(200).json(fallbackQuote);
    }

    // Parse the JSON returned by Gemini
    let parsed;
    try {
      parsed = JSON.parse(candidateText.trim());
    } catch {
      // In case of markdown formatting like ```json ... ```
      const cleaned = candidateText.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    return res.status(200).json({
      quote: parsed.quote || fallbackQuote.quote,
      author: parsed.author || "Discipline Core",
      source: "gemini",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error in /api/quote:", err);
    return res.status(200).json({
      ...fallbackQuote,
      source: "error_fallback",
    });
  }
}
