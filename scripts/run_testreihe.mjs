import fs from 'fs';
import path from 'path';

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
    console.error("Fehler: OPENROUTER_API_KEY Umgebungsvariable ist nicht gesetzt.");
    process.exit(1);
}

const PROJECT_DIR = 'c:/Users/ich/Desktop/code/_projects/Nodges';
const DOC_DIR = path.join(PROJECT_DIR, 'doc');
const DATA_DIR = path.join(PROJECT_DIR, 'public/data');

// Sicherstellen, dass Verzeichnisse existieren
if (!fs.existsSync(DOC_DIR)) fs.mkdirSync(DOC_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Lese Prompts
const ontologyPrompt = fs.readFileSync(path.join(PROJECT_DIR, 'public/prompts/build_5_ontology_prompt.md'), 'utf-8');
const dataPrompt = fs.readFileSync(path.join(PROJECT_DIR, 'public/prompts/build_5_data_prompt.md'), 'utf-8');
const visualPrompt = fs.readFileSync(path.join(PROJECT_DIR, 'public/prompts/build_5_visual_prompt.md'), 'utf-8');

const USER_PROMPT = `Erstelle ein 3D/4D-Netzwerk des Sonnensystems über den Verlauf eines Jahres mit 60 Keyframes (Zeitschritte von 0 bis 59). Im Zentrum steht die Sonne (fixiert). Um die Token-Limits der API nicht zu überschreiten, beschränke dich auf die Planeten Erde, Mars und Jupiter, die die Sonne umkreisen.
Nutze das temporal-Objekt mit validFrom, validTo und history für diese Planeten.
In der history muss jeder Planet für jeden Zeitschritt (0 bis 59) einen Keyframe haben, in dem seine 3D-Position ('position': { 'x': ..., 'y': ..., 'z': ... }) im Raum so verändert wird, dass er eine kreisförmige Bahn um die Sonne beschreibt (Nutze präzise x- und z-Koordinaten basierend auf Sinus/Kosinus für die Kreisbahn, y = 0).
Definiere eine Beziehung 'orbit' zwischen den Planeten und der Sonne.`;

const MODELS = [
    { id: 'openai/gpt-4o-mini', shortName: 'gpt_4o_mini' },
    { id: 'google/gemini-2.5-flash', shortName: 'gemini_2_5_flash' },
    { id: 'anthropic/claude-3-haiku', shortName: 'claude_3_haiku' },
    { id: 'qwen/qwen3-coder:free', shortName: 'qwen_3_coder_free' },
    { id: 'qwen/qwen-2.5-72b-instruct', shortName: 'qwen_2_5_72b' }
];

async function callOpenRouter(systemPrompt, userPrompt, model, responseFormat = { type: 'json_object' }) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://banixx.github.io/Nodges/',
            'X-Title': 'Nodges Testreihe',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            provider: { data_collection: 'deny' },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: responseFormat,
            temperature: 0.1
        })
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(`OpenRouter HTTP ${response.status}: ${text}`);
    }

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(`Konnte API-Antwort nicht parsen: ${text}`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
        if (data.error) {
            throw new Error(`API Fehler: ${data.error.message || JSON.stringify(data.error)}`);
        }
        throw new Error(`Kein Inhalt in choices: ${JSON.stringify(data)}`);
    }
    return content;
}

function cleanJSON(text) {
    let clean = text.trim();
    if (clean.startsWith('```')) {
        clean = clean.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    return JSON.parse(clean);
}

async function runModelTest(modelInfo) {
    console.log(`\n=== Starte Test für Modell: ${modelInfo.id} ===`);
    const results = {
        model: modelInfo.id,
        shortName: modelInfo.shortName,
        step1: { success: false, timeMs: 0, error: null },
        step2: { success: false, timeMs: 0, error: null },
        step3: { success: false, timeMs: 0, error: null },
        overall: { success: false, fileCreated: null }
    };

    let step1Data = null;
    let step2Data = null;
    let step3Data = null;

    // Schritt 1: Ontologie
    try {
        console.log(`[Schritt 1] Generiere Ontologie...`);
        const startTime = Date.now();
        const step1Prompt = `Erstelle ein dataModel (Ontologie) basierend auf der folgenden Anfrage:\n\n${USER_PROMPT}`;
        const rawContent = await callOpenRouter(ontologyPrompt, step1Prompt, modelInfo.id);
        step1Data = cleanJSON(rawContent);
        results.step1.success = true;
        results.step1.timeMs = Date.now() - startTime;
        console.log(`[Schritt 1] Erfolgreich in ${results.step1.timeMs}ms`);
    } catch (err) {
        results.step1.error = err.message;
        console.error(`[Schritt 1] Fehler: ${err.message}`);
        return results;
    }

    // Schritt 2: Daten
    try {
        console.log(`[Schritt 2] Generiere Daten...`);
        const startTime = Date.now();
        const step2Prompt = `Nutze EXAKT das folgende Schema (Ontologie), um die Daten zu generieren:\n\n${JSON.stringify(step1Data, null, 2)}\n\nBefuelle nun die data.entities und data.relationships Arrays basierend auf der Originalanfrage:\n${USER_PROMPT}`;
        const rawContent = await callOpenRouter(dataPrompt, step2Prompt, modelInfo.id);
        step2Data = cleanJSON(rawContent);
        results.step2.success = true;
        results.step2.timeMs = Date.now() - startTime;
        console.log(`[Schritt 2] Erfolgreich in ${results.step2.timeMs}ms`);
    } catch (err) {
        results.step2.error = err.message;
        console.error(`[Schritt 2] Fehler: ${err.message}`);
        return results;
    }

    // Merge Schritt 1 & 2
    const mergedData = { ...step1Data, ...step2Data };

    // Schritt 3: Visual Mappings
    try {
        console.log(`[Schritt 3] Generiere Visuelle Mappings...`);
        const startTime = Date.now();
        const step3Prompt = `Erstelle die visuellen Mappings fuer diesen Datensatz:\n\n${JSON.stringify(mergedData, null, 2)}`;
        const rawContent = await callOpenRouter(visualPrompt, step3Prompt, modelInfo.id);
        step3Data = cleanJSON(rawContent);
        results.step3.success = true;
        results.step3.timeMs = Date.now() - startTime;
        console.log(`[Schritt 3] Erfolgreich in ${results.step3.timeMs}ms`);
    } catch (err) {
        results.step3.error = err.message;
        console.error(`[Schritt 3] Fehler: ${err.message}`);
        return results;
    }

    // Finaler Merge und Speichern
    try {
        const finalData = { ...mergedData, ...step3Data };
        // Name mit _102
        const fileName = `0_102_sonnensystem_${modelInfo.shortName}.json`;
        const filePath = path.join(DATA_DIR, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(finalData, null, 2), 'utf-8');
        results.overall.success = true;
        results.overall.fileCreated = filePath;
        console.log(`[Ergebnis] Datei erfolgreich gespeichert unter: ${filePath}`);
        
        // Kopiere auch in doc/ falls gewünscht
        const docFilePath = path.join(DOC_DIR, `0_102_${modelInfo.shortName}_sonnensystem.json`);
        fs.writeFileSync(docFilePath, JSON.stringify(finalData, null, 2), 'utf-8');
    } catch (err) {
        console.error(`[Ergebnis] Fehler beim Speichern der Datei: ${err.message}`);
    }

    return results;
}

async function run() {
    const reportData = [];
    for (const model of MODELS) {
        try {
            const res = await runModelTest(model);
            reportData.push(res);
        } catch (e) {
            console.error(`Fataler Fehler für Modell ${model.id}:`, e);
        }
    }

    // Report schreiben
    let md = `# Testreihe: Generierung Sonnensystem mit Temporal-Objekt (Version 0.102.4)

Dieses Dokument wurde automatisch erstellt, um die Leistung verschiedener LLM-Modelle beim Generieren eines 4D-Netzwerks des Sonnensystems mit 60 Keyframes zu vergleichen.

## Testergebnisse

| Modell | Schritt 1 (Ontologie) | Schritt 2 (Daten) | Schritt 3 (Visual Mappings) | Gesamtstatus | Details / Fehler |
|---|---|---|---|---|---|
`;

    for (const res of reportData) {
        const s1 = res.step1.success ? `✅ (${res.step1.timeMs}ms)` : `❌`;
        const s2 = res.step2.success ? `✅ (${res.step2.timeMs}ms)` : `❌`;
        const s3 = res.step3.success ? `✅ (${res.step3.timeMs}ms)` : `❌`;
        const status = res.overall.success ? `🟢 ERFOLG` : `🔴 FEHLER`;
        const errorDetail = res.step1.error || res.step2.error || res.step3.error || '-';
        md += `| **${res.model}** | ${s1} | ${s2} | ${s3} | ${status} | ${errorDetail} |\n`;
    }

    md += `\n## Beobachtungen und Analyse\n\n`;
    
    // Kurze Analyse
    for (const res of reportData) {
        md += `### ${res.model}\n`;
        if (res.overall.success) {
            const dataFile = path.join(DATA_DIR, `0_102_sonnensystem_${res.shortName}.json`);
            const content = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
            const entityCount = content.data?.entities?.length || 0;
            const relCount = content.data?.relationships?.length || 0;
            const earth = content.data?.entities?.find(e => e.id === 'erde' || e.label?.toLowerCase() === 'erde');
            const keyframeCount = earth?.temporal?.history?.length || 0;
            
            md += `- **Entitäten**: ${entityCount}\n`;
            md += `- **Beziehungen**: ${relCount}\n`;
            md += `- **Keyframes (Erde)**: ${keyframeCount} / 60 angeforderten\n`;
            md += `- **Dateipfad**: \`public/data/0_102_sonnensystem_${res.shortName}.json\`\n\n`;
        } else {
            md += `- Generierung fehlgeschlagen.\n\n`;
        }
    }

    const reportPath = path.join(DOC_DIR, '0_102_4_testreihe.md');
    fs.writeFileSync(reportPath, md, 'utf-8');
    console.log(`\nTestreihe beendet. Bericht gespeichert unter: ${reportPath}`);
}

run();
