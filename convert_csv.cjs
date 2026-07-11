const fs = require('fs');
const path = require('path');

// Read the CSV
const csvPath = path.join(__dirname, 'Griech_V3.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

const lines = csvContent.split('\n').filter(line => line.trim() !== '');
const headers = lines[0].split(',').map(h => h.trim());

// We need to handle quoted fields in CSV properly
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

const entities = [];
const relationships = [];
const nodeNames = new Set();
const nameToId = {};

// Parse entities
for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals.length < 2) continue;

    const name = vals[0].replace(/"/g, '');
    const category = vals[1] ? vals[1].replace(/"/g, '') : '';
    const domain = vals[2] ? vals[2].replace(/"/g, '') : '';
    const kin = vals[3] ? vals[3].replace(/"/g, '') : '';
    const events = vals[4] ? vals[4].replace(/"/g, '') : '';
    const personality = vals[5] ? vals[5].replace(/"/g, '') : '';

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // basic position mapping for default scatter
    const x = (Math.random() - 0.5) * 500;
    const y = (Math.random() - 0.5) * 500;
    const z = (Math.random() - 0.5) * 500;

    entities.push({
        id,
        type: category || 'Gott',
        label: name,
        position: { x, y, z },
        category,
        domain,
        kin,
        events,
        personality
    });

    nodeNames.add(name);
    nameToId[name] = id;
}

// Very basic relationship extraction by looking for other node names in the text fields
// We will look for names in 'kin' and 'events' and 'personality'
const allNames = Array.from(nodeNames).sort((a, b) => b.length - a.length); // match longer names first

let edgeId = 0;
const addedEdges = new Set();

function addEdge(source, target, type, label) {
    if (source === target) return;
    const key = `${source}-${target}-${type}`;
    if (!addedEdges.has(key)) {
        relationships.push({
            id: `e${edgeId++}`,
            type,
            source,
            target,
            label
        });
        addedEdges.add(key);
    }
}

for (const entity of entities) {
    const kin = entity.kin;
    
    // Extract parent/child relations
    if (kin) {
        for (const targetName of allNames) {
            if (targetName === entity.label) continue;
            
            // basic check if targetName is in kin string as a word
            const regex = new RegExp(`\\b${targetName}\\b`);
            if (regex.test(kin)) {
                if (kin.toLowerCase().includes('sohn') || kin.toLowerCase().includes('tochter')) {
                    addEdge(entity.id, nameToId[targetName], 'kind_von', 'Kind von');
                } else if (kin.toLowerCase().includes('vater') || kin.toLowerCase().includes('mutter')) {
                    addEdge(nameToId[targetName], entity.id, 'kind_von', 'Kind von');
                } else {
                    addEdge(entity.id, nameToId[targetName], 'verwandt', 'Verwandt');
                }
            }
        }
    }
    
    // Extract relations from events
    if (entity.events) {
        for (const targetName of allNames) {
            if (targetName === entity.label) continue;
            const regex = new RegExp(`\\b${targetName}\\b`);
            if (regex.test(entity.events)) {
                addEdge(entity.id, nameToId[targetName], 'ereignis', 'Interaktion');
            }
        }
    }

    // Extract relations from personality
    if (entity.personality) {
        for (const targetName of allNames) {
            if (targetName === entity.label) continue;
            const regex = new RegExp(`\\b${targetName}\\b`);
            if (regex.test(entity.personality)) {
                if (entity.personality.toLowerCase().includes('feind') || entity.personality.toLowerCase().includes('hass') || entity.personality.toLowerCase().includes('zorn')) {
                    addEdge(entity.id, nameToId[targetName], 'konflikt', 'Konflikt');
                } else if (entity.personality.toLowerCase().includes('liebt') || entity.personality.toLowerCase().includes('liebe')) {
                    addEdge(entity.id, nameToId[targetName], 'liebe', 'Liebe');
                } else {
                    addEdge(entity.id, nameToId[targetName], 'beziehung', 'Beziehung');
                }
            }
        }
    }
}

// Collect unique categories for datamodel types
const categories = new Set(entities.map(e => e.type));

const dataModel = {
    entities: {},
    relationships: {
        kind_von: { properties: {} },
        verwandt: { properties: {} },
        ereignis: { properties: {} },
        konflikt: { properties: {} },
        liebe: { properties: {} },
        beziehung: { properties: {} }
    }
};

for (const cat of categories) {
    dataModel.entities[cat] = {
        properties: {
            category: { type: "categorical" },
            domain: { type: "categorical" },
            kin: { type: "categorical" },
            events: { type: "categorical" },
            personality: { type: "categorical" }
        }
    };
}

const graphData = {
    system: "Mythology_Graph",
    metadata: {
        created: new Date().toISOString(),
        version: "1.0",
        author: "Antigravity",
        description: "Griechische Mythologie aus Griech_V3.csv"
    },
    dataModel,
    visualMappings: {
        defaultPresets: {
            "Olympier": {
                color: { source: "type", function: "categorical", palette: "cool" },
                size: { source: "type", function: "constant", params: { value: 15 } }
            },
            "Titan": {
                color: { source: "type", function: "categorical", palette: "warm" },
                size: { source: "type", function: "constant", params: { value: 20 } }
            }
        }
    },
    data: {
        entities,
        relationships
    }
};

const outputPath = path.join(__dirname, 'public', 'data', 'griech_v3.json');
fs.writeFileSync(outputPath, JSON.stringify(graphData, null, 2), 'utf-8');
console.log(`Generated ${entities.length} entities and ${relationships.length} relationships.`);
console.log(`Saved to ${outputPath}`);
