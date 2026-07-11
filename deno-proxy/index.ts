const allowedOrigins = [
  "https://banixx.github.io",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000"
];

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  // Erlaube Anfragen von localhost und GitHub Pages
  const corsOrigin = allowedOrigins.includes(origin) ? origin : "https://banixx.github.io";

  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // 1. CORS Preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 2. Nur POST-Anfragen zulassen
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  // 3. API Key aus Deno Environment Variables lesen
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  
  if (!OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: "Server-Konfiguration fehlerhaft: API-Key fehlt." }), { 
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  try {
    const body = await req.text();
    
    // 4. Anfrage an OpenRouter weiterleiten
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://banixx.github.io/Nodges/",
        "X-Title": "Nodges"
      },
      body: body
    });

    const data = await response.text();
    
    // 5. Antwort zurück an unser Frontend senden
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
