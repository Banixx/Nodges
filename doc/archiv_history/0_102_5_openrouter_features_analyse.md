# OpenRouter Features - Relevanz fuer Nodges

Analyse der OpenRouter-Dokumentation auf nuetzliche Services fuer die Nodges-Entwicklungssituation.

---

## 1. Structured Outputs (HOCH RELEVANT)

**Was es ist:** OpenRouter bietet serverseitige JSON-Schema-Erzwingung. Statt nur `response_format: { type: "json_object" }` (was wir aktuell nutzen) kann man ein **vollstaendiges JSON-Schema** direkt im Request mitgeben und OpenRouter **erzwingt** die Einhaltung auf Server-Seite.

**Relevanz fuer Nodges:** Das ist exakt das, was Build 6 braucht. Aktuell haengen wir das Zod-generierte JSON-Schema nur als Text in den System-Prompt. Mit dem nativen `json_schema`-Modus wuerde OpenRouter selbst sicherstellen, dass die Antwort dem Schema entspricht - keine halluzierten Felder, keine Syntaxfehler.

**Umsetzung:** Statt `response_format: { type: "json_object" }` senden wir:
```json
{
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "GraphData",
      "strict": true,
      "schema": { ... das Zod-generierte Schema ... }
    }
  }
}
```

**Model Support laut Doku:**
- OpenAI (GPT-4o+) - nativ unterstuetzt
- Google Gemini - nativ unterstuetzt
- Anthropic (Sonnet 4.5, Opus 4.1+) - unterstuetzt
- Die meisten Open-Source Modelle
- Alle Fireworks-gehosteten Modelle

**Filterbar:** `https://openrouter.ai/models?supported_parameters=structured_outputs`

---

## 2. Model Fallbacks (HOCH RELEVANT)

**Was es ist:** Man kann eine **Liste von Modellen** statt einem einzelnen Modell angeben. Wenn das erste Modell fehlschlaegt (Rate-Limit, Downtime, Moderation-Flag), springt OpenRouter automatisch zum naechsten.

**Relevanz fuer Nodges:** Perfekt fuer die BYOK-Situation. Wenn ein User ein guenstiges Modell waehlt, das bei komplexen Graphen scheitert, koennte automatisch auf ein zuverlaessigeres Fallback-Modell gewechselt werden. Statt `model: "..."` senden wir `models: ["erste-wahl", "fallback-1", "fallback-2"]`.

**Umsetzung:** Im LLMService den `model`-Parameter durch `models`-Array ersetzen und dem User optional einen Fallback konfigurieren lassen.

---

## 3. Response Caching (MITTEL-HOCH RELEVANT)

**Was es ist:** Identische API-Requests werden gecacht. Ein Cache-Hit kostet **0 Tokens** (= gratis). Aktivierung per Header `X-OpenRouter-Cache: true` oder per Preset.

**Relevanz fuer Nodges:**
- **Entwicklung/Testing:** Wenn wir waehrend der Entwicklung denselben Prompt wiederholt senden (z.B. zum Debuggen des Parsers), zahlen wir nach dem ersten Call nichts mehr.
- **Unit Tests:** Man kann mit `temperature: 0` und aktivem Cache deterministische Tests schreiben, die gegen echte LLM-Antworten validieren, ohne bei jedem Testlauf Credits zu verbrennen. TTL ist konfigurierbar bis 24h.
- **Demo-Modus:** Fuer eine Live-Demo koennte man vordefinierte Prompts cachen.

**Einschraenkung:** Inkompatibel mit Account-Level ZDR (Zero Data Retention). Wir nutzen aber nur Request-Level `provider.zdr`, das stört den Cache nicht.

---

## 4. Zero Completion Insurance (NIEDRIG - BEREITS AKTIV)

**Was es ist:** Wenn ein Modell 0 Tokens zurueckgibt (leere Antwort), wird nichts berechnet.

**Relevanz:** Gut zu wissen, aber kein Handlungsbedarf. Schuetzt uns automatisch bei fehlgeschlagenen Generierungen.

---

## 5. Auto Exacto (MITTEL RELEVANT)

**Was es ist:** OpenRouter optimiert automatisch die Provider-Reihenfolge fuer Tool-Calling/Structured-Output Requests anhand von Erfolgsrate und Durchsatz.

**Relevanz fuer Nodges:** Wenn wir auf den nativen `json_schema`-Modus umsteigen, wuerde Auto Exacto automatisch den Provider waehlen, der bei Structured Outputs die hoechste Erfolgsquote hat. Das erledigt OpenRouter im Hintergrund.

---

## 6. Workspace Budgets (NIEDRIG-MITTEL)

**Was es ist:** Man kann pro API-Key Budgets/Limits definieren (z.B. max. $5/Monat).

**Relevanz:** Nützlich fuer den BYOK-Betrieb - man koennte Usern empfehlen, limitierte Keys mit Budget zu nutzen.

---

## Zusammenfassung: Prioritaeten

| Feature | Relevanz | Aufwand | Empfehlung |
|---|---|---|---|
| Structured Outputs (`json_schema`) | Sehr hoch | Gering (1 Zeile im Request) | **Sofort umsetzen** |
| Model Fallbacks | Hoch | Mittel (UI + LLMService) | Naechster Sprint |
| Response Caching | Mittel-hoch | Gering (1 Header) | Fuer Tests/Dev sofort |
| Auto Exacto | Mittel | Null (automatisch) | Kommt gratis mit |
| Zero Completion Insurance | Niedrig | Null (automatisch) | Bereits aktiv |

### Empfohlene naechste Schritte:
1. **Structured Outputs aktivieren:** `response_format` von `json_object` auf `json_schema` umstellen und das Zod-Schema direkt einbinden. Das ist die mit Abstand wirkungsvollste Aenderung.
2. **Response Caching fuer Dev:** Header `X-OpenRouter-Cache: true` bei Testlaeufen mitsenden, spart beim iterativen Entwickeln massiv Credits.
3. **Model Fallbacks:** UI erweitern, damit User ein Backup-Modell waehlen koennen.
