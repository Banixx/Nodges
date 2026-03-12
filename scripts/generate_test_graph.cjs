const fs = require('fs');
const path = require('path');

/**
 * Generiert Test-Graphdaten im Semantic Graph Format.
 * 
 * Nutzung: node generate_test_graph.js <anzahlKnoten> <anzahlKanten> <outputDatei>
 */

const numNodes = parseInt(process.argv[2]) || 500;
const numEdges = parseInt(process.argv[3]) || 800;
const outputFile = process.argv[4] || `public/data/generated_${numNodes}.json`;

const range = 50; // Räumliche Ausdehnung (-50 bis 50)

console.log(`Generiere ${numNodes} Knoten und ${numEdges} Kanten...`);

const nodes = [];
for (let i = 0; i < numNodes; i++) {
    nodes.push({
        id: `node${i}`,
        type: 'node',
        label: `Node ${i}`,
        position: {
            x: (Math.random() - 0.5) * range * 2,
            y: (Math.random() - 0.5) * range * 2,
            z: (Math.random() - 0.5) * range * 2
        }
    });
}

const edges = [];
const existingEdges = new Set();

while (edges.length < numEdges) {
    const sourceIdx = Math.floor(Math.random() * numNodes);
    const targetIdx = Math.floor(Math.random() * numNodes);

    if (sourceIdx === targetIdx) continue;

    const edgeId = `edge${edges.length}`;
    const pair = sourceIdx < targetIdx ? `${sourceIdx}-${targetIdx}` : `${targetIdx}-${sourceIdx}`;

    if (existingEdges.has(pair)) continue;

    existingEdges.add(pair);
    edges.push({
        id: edgeId,
        type: 'connection',
        source: `node${sourceIdx}`,
        target: `node${targetIdx}`,
        label: `Edge ${edges.length}`,
        offset: 0
    });
}

const graph = {
    system: `Generated Graph ${numNodes}`,
    metadata: {
        created: new Date().toISOString(),
        version: "2.0",
        author: "Nodges Generator",
        description: `Stresstest-Graph mit ${numNodes} Knoten und ${numEdges} Kanten`
    },
    dataModel: {
        entities: {
            node: {
                properties: {
                    position: {
                        type: "spatial",
                        coordinates: ["x", "y", "z"]
                    }
                }
            }
        },
        relationships: {
            connection: {
                properties: {
                    offset: {
                        type: "continuous",
                        range: [-10, 10],
                        unit: "units"
                    }
                }
            }
        }
    },
    data: {
        entities: nodes,
        relationships: edges
    }
};

const absolutePath = path.resolve(outputFile);
const dir = path.dirname(absolutePath);

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(absolutePath, JSON.stringify(graph, null, 2));

// Backup in den .gemini Ordner (wie gefordert in GEMINI.md)
const backupDir = '/home/node/.gemini/antigravity/brain/b4148cfe-0635-4e7f-b0c0-5dfdd3ce355e';
const backupFile = path.join(backupDir, path.basename(outputFile));
fs.writeFileSync(backupFile, JSON.stringify(graph, null, 2));

console.log(`Erfolgreich geschrieben nach: ${absolutePath}`);
console.log(`Backup erstellt unter: ${backupFile}`);
