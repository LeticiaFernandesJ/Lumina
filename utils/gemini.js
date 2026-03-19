async function geminiGenerate(apiKey, prompt) {
  const attempts = [
    { version: 'v1beta', model: 'gemini-2.0-flash-lite' },
    { version: 'v1beta', model: 'gemini-2.0-flash' },
    { version: 'v1beta', model: 'gemini-2.5-flash' },
    { version: 'v1beta', model: 'gemini-flash-latest' },
  ];

  let lastError = null;

  for (const { version, model } of attempts) {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(`[${version}] ${model} → ${response.status}: ${data?.error?.message?.slice(0, 120)}`);
        lastError = data?.error?.message || `HTTP ${response.status}`;
        // Se for quota (429), espera 15s e tenta o próximo
        if (response.status === 429) {
          console.log('⏳ Quota atingida, aguardando 15s...');
          await new Promise(r => setTimeout(r, 15000));
        }
        continue;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = 'Resposta vazia';
        continue;
      }

      console.log(`✅ Funcionou: [${version}] ${model}`);
      return text;

    } catch (e) {
      console.log(`[${version}] ${model} → erro: ${e.message}`);
      lastError = e.message;
    }
  }

  throw new Error('Erro na API Gemini: ' + lastError);
}

function extractJSON(text) {
  try { return JSON.parse(text.trim()); } catch {}
  const noMd = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(noMd); } catch {}
  const as = text.indexOf('['), ae = text.lastIndexOf(']');
  if (as !== -1 && ae > as) { try { return JSON.parse(text.slice(as, ae + 1)); } catch {} }
  const os = text.indexOf('{'), oe = text.lastIndexOf('}');
  if (os !== -1 && oe > os) { try { return JSON.parse(text.slice(os, oe + 1)); } catch {} }
  throw new Error('Não foi possível extrair JSON. Resposta: ' + text.slice(0, 300));
}

module.exports = { geminiGenerate, extractJSON };
