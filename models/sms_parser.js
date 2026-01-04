const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function parseWithGroq({ text, todayISO }) {
  const system = `You extract structured timesheet data from SMS text.
Return ONLY valid JSON matching this schema:
{
  "hours": number|null,
  "dateISO": string|null,
  "description": string|null,
  "confidence": number,         // 0..1
  "notes": string|null
}
Rules:
- hours must be a positive number if present (e.g., 3, 3.5)
- dateISO must be YYYY-MM-DD if present; resolve relative days using todayISO
- description is the work description (no hours/date words)
- If missing/unclear, use null fields and explain briefly in notes.`;

  const user = `todayISO: ${todayISO}
SMS: """${text}"""
Examples:
- "8h today on API work" -> hours=8, dateISO=todayISO, description="API work"
- "3.5 hours yesterday on frontend" -> dateISO=todayISO - 1 day
- "4h on database design 01/05" -> interpret as MM/DD in current year unless year is given`;

  const resp = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant", 
    temperature: 0,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
  });

  const content = resp.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}

module.exports = { parseWithGroq };
