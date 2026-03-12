const fs = require('fs');

const NUM_NODES = 500;
const NUM_EDGES = 800;

const entities = [];
for (let i = 0; i < NUM_NODES; i++) {
    entities.push({
        id: "node" + i,
        type: "node",
        label: "node " + i,
        position: {
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            z: Math.random() * 100 - 50
        }
    });
}

const relationships = [];
for (let i = 0; i < NUM_EDGES; i++) {
    const source = Math.floor(Math.random() * NUM_NODES);
    let target = Math.floor(Math.random() * NUM_NODES);
    while (target === source) {
        target = Math.floor(Math.random() * NUM_NODES); // prevent self-links just in case
    }
    relationships.push({
        id: "edge" + i,
        type: "connection",
        source: "node" + source,
        target: "node" + target,
        label: "edge " + i,
        offset: 0
    });
}

const graphData = {
    system: "Generated Graph Example aaa_500",
    metadata: {
        created: new Date().toISOString(),
        version: "2.0",
        author: "Nodges Team",
        description: `Generierter Graph mit ${NUM_NODES} Knoten und ${NUM_EDGES} Kanten`
    },
    dataModel: {
        entities: {
            node: {
                properties: {
                    position: { type: "spatial", coordinates: ["x", "y", "z"] }
                }
            }
        },
        relationships: {
            connection: {
                properties: {
                    offset: { type: "continuous", range: [-10, 10], unit: "units" }
                }
            }
        }
    },
    data: {
        entities,
        relationships
    }
};

fs.writeFileSync('./public/data/aaa_500.json', JSON.stringify(graphData, null, 2));
console.log('Erfolgreich ./public/data/aaa_500.json generiert!');
