const fs = require('fs');

const emotionCatalog = {
    'Liebe': { valence: 0.9, arousal: 0.6 },
    'Zuneigung': { valence: 0.6, arousal: 0.3 },
    'Vertrauen': { valence: 0.5, arousal: 0.2 },
    'Zorn': { valence: -0.8, arousal: 0.8 },
    'Hass': { valence: -0.9, arousal: 0.8 },
    'Neid': { valence: -0.6, arousal: 0.6 },
    'Eifersucht': { valence: -0.7, arousal: 0.7 },
    'Angst': { valence: -0.8, arousal: 0.7 },
    'Trauer': { valence: -0.7, arousal: 0.2 },
    'Freude': { valence: 0.8, arousal: 0.7 },
    'Neutral': { valence: 0.0, arousal: 0.0 }
};

const inputFile = 'public/data/griech_v3.json';
const outputFile = 'public/data/gv4.json';
const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

const nodes = data.data.entities || data.data.nodes;
const nodeMap = new Map(nodes.map(n => [n.id, n]));
const edges = data.data.relationships || data.data.edges;

// Zähle den Degree für jeden Knoten (weitere Möglichkeit zur Skalierung)
const nodeDegrees = {};
nodes.forEach(n => nodeDegrees[n.id] = 0);
edges.forEach(e => {
    if (nodeDegrees[e.source] !== undefined) nodeDegrees[e.source]++;
    if (nodeDegrees[e.target] !== undefined) nodeDegrees[e.target]++;
});

function detectEmotion(edge) {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    let defaultEmotion = 'Neutral';
    if (edge.type === 'liebe') defaultEmotion = 'Liebe';
    if (edge.type === 'konflikt') defaultEmotion = 'Zorn';
    if (edge.type === 'kind_von' || edge.type === 'verwandt') defaultEmotion = 'Vertrauen';
    if (edge.type === 'beziehung') defaultEmotion = 'Zuneigung';

    if (sourceNode && sourceNode.personality) {
        const text = sourceNode.personality.toLowerCase();
        const targetName = (targetNode && targetNode.label) ? targetNode.label.toLowerCase() : '';
        
        if (targetName && text.includes(targetName)) {
            if (text.includes('hass') || text.includes('hasst')) return 'Hass';
            if (text.includes('zorn')) return 'Zorn';
            if (text.includes('neid')) return 'Neid';
            if (text.includes('eifersucht') || text.includes('eifersüchtig')) return 'Eifersucht';
            if (text.includes('liebe') || text.includes('liebt')) return 'Liebe';
            if (text.includes('angst')) return 'Angst';
            if (text.includes('trauer')) return 'Trauer';
        } else {
            if (edge.type === 'konflikt') {
                if (text.includes('neid')) return 'Neid';
                if (text.includes('eifersucht')) return 'Eifersucht';
                if (text.includes('hass')) return 'Hass';
            }
        }
    }
    return defaultEmotion;
}

edges.forEach(edge => {
    const emotion = detectEmotion(edge);
    const scales = emotionCatalog[emotion] || emotionCatalog['Neutral'];
    
    edge.emotion_category = emotion;
    edge.emotion_valence = scales.valence;
    edge.emotion_arousal = scales.arousal;
});

// Update Nodes with Degree
nodes.forEach(node => {
    node.degree = nodeDegrees[node.id] || 0;
});

// Update DataModel (Metadaten für das Mapping Panel)
if (!data.dataModel.relationships) {
    data.dataModel.relationships = {};
}

// Füge Kanten-Attribute hinzu
for (const relType in data.dataModel.relationships) {
    if (!data.dataModel.relationships[relType].properties) {
        data.dataModel.relationships[relType].properties = {};
    }
    const props = data.dataModel.relationships[relType].properties;
    props.emotion_category = { type: 'categorical' };
    props.emotion_valence = { type: 'continuous', min: -1, max: 1 };
    props.emotion_arousal = { type: 'continuous', min: 0, max: 1 };
}

// Füge Knoten-Attribute hinzu (Degree)
if (!data.dataModel.entities) {
    data.dataModel.entities = {};
}
for (const entityType in data.dataModel.entities) {
    if (!data.dataModel.entities[entityType].properties) {
        data.dataModel.entities[entityType].properties = {};
    }
    const props = data.dataModel.entities[entityType].properties;
    props.degree = { type: 'continuous', min: 0 };
}

data.metadata.version = "4.0";
data.metadata.description = "Griechische Mythologie mit emotionalem Katalog (Valenz & Arousal) sowie Degree-Skala";

fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully generated ${outputFile} with emotion attributes and degree metric!`);
