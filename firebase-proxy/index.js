const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require('firebase-functions/params');
const cors = require('cors');

// Definiere das Secret für den API-Key
// Du musst dieses Secret nach dem Deployment in Firebase speichern.
// Befehl: firebase functions:secrets:set OPENROUTER_API_KEY
const openRouterApiKey = defineSecret('OPENROUTER_API_KEY');

// Konfiguriere CORS so, dass nur deine GitHub Pages darauf zugreifen dürfen.
// Für lokales Testen erlauben wir auch localhost (kann später entfernt werden).
const corsOptions = {
    origin: ['https://banixx.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['POST', 'OPTIONS']
};

const corsHandler = cors(corsOptions);

exports.nodgesProxy = onRequest(
    { secrets: [openRouterApiKey] },
    (req, res) => {
        // Wende CORS an
        corsHandler(req, res, async () => {
            // Erlaube nur POST-Anfragen
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
            }

            try {
                const { model, messages, response_format, provider } = req.body;

                if (!model || !messages) {
                    return res.status(400).json({ error: 'Missing required parameters: model, messages' });
                }

                const apiKey = openRouterApiKey.value();
                if (!apiKey) {
                    console.error("OPENROUTER_API_KEY secret is not set.");
                    return res.status(500).json({ error: 'Server configuration error.' });
                }

                // Proxy-Anfrage an OpenRouter senden
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'HTTP-Referer': 'https://banixx.github.io/Nodges/',
                        'X-Title': 'Nodges 3D Graph',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: messages,
                        response_format: response_format || { type: 'json_object' },
                        provider: provider || { data_collection: 'deny' }
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error("OpenRouter API Error:", data);
                    return res.status(response.status).json(data);
                }

                // Rückgabe an das Frontend
                return res.status(200).json(data);

            } catch (error) {
                console.error("Proxy Error:", error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
);
