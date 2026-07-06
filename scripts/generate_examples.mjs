import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'public', 'examples');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// Helper for colors
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// ==========================================
// 109a: Google/Alphabet Apps
// ==========================================
function generate109a() {
    const apps = [
        { id: "alphabet", name: "Alphabet Inc", start: 2015, end: 2025, type: "company" },
        { id: "google", name: "Google Search", start: 1998, end: 2025, type: "core" },
        { id: "youtube", name: "YouTube", start: 2005, end: 2025, type: "product" },
        { id: "gmail", name: "Gmail", start: 2004, end: 2025, type: "product" },
        { id: "maps", name: "Google Maps", start: 2005, end: 2025, type: "product" },
        { id: "android", name: "Android", start: 2008, end: 2025, type: "core" },
        { id: "orkut", name: "Orkut", start: 2004, end: 2014, type: "failed" },
        { id: "reader", name: "Google Reader", start: 2005, end: 2013, type: "failed" },
        { id: "wave", name: "Google Wave", start: 2009, end: 2012, type: "failed" },
        { id: "plus", name: "Google+", start: 2011, end: 2019, type: "failed" },
        { id: "glass", name: "Google Glass", start: 2013, end: 2025, type: "hardware" },
        { id: "stadia", name: "Stadia", start: 2019, end: 2023, type: "failed" },
        { id: "pixel", name: "Pixel", start: 2016, end: 2025, type: "hardware" },
        { id: "deepmind", name: "DeepMind", start: 2014, end: 2025, type: "ai" },
        { id: "gemini", name: "Gemini", start: 2023, end: 2025, type: "ai" }
    ];

    const entities = apps.map(app => {
        const history = [];
        for (let year = app.start; year <= app.end; year++) {
            let size = 1 + (year - app.start) * 0.5;
            let color = app.type === "failed" && year > app.end - 2 ? "#ff0000" : 
                        app.type === "ai" ? "#9b59b6" :
                        app.type === "core" ? "#3498db" : "#2ecc71";
            history.push({
                timestamp: year,
                changes: { size, color }
            });
        }
        return {
            id: app.id,
            type: app.type,
            name: app.name,
            temporal: {
                validFrom: app.start,
                validTo: app.end < 2025 ? app.end : undefined,
                history
            }
        };
    });

    const relationships = [
        { id: "e1", start: "alphabet", end: "google", type: "owns" },
        { id: "e2", start: "alphabet", end: "deepmind", type: "owns" },
        { id: "e3", start: "google", end: "youtube", type: "owns" },
        { id: "e4", start: "google", end: "gmail", type: "owns" },
        { id: "e5", start: "google", end: "maps", type: "owns" },
        { id: "e6", start: "google", end: "android", type: "owns" },
        { id: "e7", start: "google", end: "orkut", type: "owns" },
        { id: "e8", start: "google", end: "reader", type: "owns" },
        { id: "e9", start: "google", end: "wave", type: "owns" },
        { id: "e10", start: "google", end: "plus", type: "owns" },
        { id: "e11", start: "google", end: "glass", type: "owns" },
        { id: "e12", start: "google", end: "stadia", type: "owns" },
        { id: "e13", start: "google", end: "pixel", type: "owns" },
        { id: "e14", start: "deepmind", end: "gemini", type: "creates" },
        { id: "e15", start: "google", end: "gemini", type: "integrates" }
    ].map(e => ({
        ...e, 
        temporal: {
            validFrom: Math.max(
                apps.find(a => a.id === e.start).start,
                apps.find(a => a.id === e.end).start
            ),
            validTo: Math.min(
                apps.find(a => a.id === e.start).end,
                apps.find(a => a.id === e.end).end
            ) < 2025 ? Math.min(
                apps.find(a => a.id === e.start).end,
                apps.find(a => a.id === e.end).end
            ) : undefined
        }
    }));

    const json = {
        system: "Nodges",
        metadata: { version: 4, schemaVersion: "3.0", description: "Alphabet Apps History" },
        dataModel: { entities: {}, relationships: {} },
        data: { entities, relationships },
        visualMappings: { defaultPresets: {} }
    };
    fs.writeFileSync(path.join(outDir, '109a_google_apps.json'), JSON.stringify(json, null, 2));
}

// ==========================================
// 109b: Swiss Map 100+ Nodes
// ==========================================
function generate109b() {
    const entities = [];
    const relationships = [];
    const nodeCount = 120;
    
    // Map dimensions (rough coords for Switzerland bounding box in local space)
    // Let's say map is width 100, height 70, so x is -50 to 50, z is -35 to 35
    for (let i = 0; i < nodeCount; i++) {
        const isHub = i % 10 === 0;
        const x = (Math.random() - 0.5) * 90;
        const y = (Math.random() - 0.5) * 60;
        
        const history = [];
        for (let t = 0; t <= 100; t += 10) {
            history.push({
                timestamp: t,
                changes: {
                    size: isHub ? 1 + (t / 100) * 3 : 0.5 + Math.random() * 0.5,
                    color: hslToHex((x + 50) * 3.6, 80, 50 + (Math.sin(t * 0.1) * 20))
                }
            });
        }

        entities.push({
            id: `ch_node_${i}`,
            type: isHub ? "hub" : "station",
            mapX: x,
            mapY: y, // Will map to z in 3D
            temporal: {
                validFrom: Math.random() * 20,
                validTo: 80 + Math.random() * 20,
                history
            }
        });
    }

    // Connect them (delaunay-like or random proximity)
    for (let i = 0; i < nodeCount; i++) {
        const e1 = entities[i];
        let connections = 0;
        for (let j = 0; j < nodeCount; j++) {
            if (i === j) continue;
            const e2 = entities[j];
            const dist = Math.hypot(e1.mapX - e2.mapX, e1.mapY - e2.mapY);
            if (dist < 15 && connections < (e1.type === 'hub' ? 5 : 2)) {
                relationships.push({
                    id: `edge_${i}_${j}`,
                    start: e1.id,
                    end: e2.id,
                    type: "connection",
                    temporal: {
                        validFrom: Math.max(e1.temporal.validFrom, e2.temporal.validFrom),
                        validTo: Math.min(e1.temporal.validTo, e2.temporal.validTo)
                    }
                });
                connections++;
            }
        }
    }

    const json = {
        system: "Nodges",
        metadata: { 
            version: 4, 
            schemaVersion: "3.0", 
            description: "Swiss Map Network",
            map: { image: "Switzerland.jpg", referenceWidth: 100, referenceHeight: 70 }
        },
        dataModel: { entities: {}, relationships: {} },
        data: { entities, relationships },
        visualMappings: { defaultPresets: {} }
    };
    fs.writeFileSync(path.join(outDir, '109b_swiss_cities.json'), JSON.stringify(json, null, 2));
}

// ==========================================
// 109c: Stress Test (Physics + Temporal)
// ==========================================
function generate109c() {
    const entities = [];
    const relationships = [];
    const nodeCount = 500;
    
    // Clusters
    const clusters = 5;
    
    for (let i = 0; i < nodeCount; i++) {
        const clusterId = i % clusters;
        const history = [];
        
        // 0 to 1000 temporal
        for (let t = 0; t <= 1000; t += 50) {
            history.push({
                timestamp: t,
                changes: {
                    size: 0.5 + Math.random() * 2,
                    color: hslToHex((clusterId * (360/clusters)) + (t*0.5)%360, 80, 50)
                }
            });
        }

        entities.push({
            id: `s_node_${i}`,
            type: `cluster_${clusterId}`,
            // We do NOT use mapX/mapY so physics can go wild
            temporal: {
                validFrom: Math.random() * 100,
                validTo: 900 + Math.random() * 100,
                history
            }
        });
    }

    // Edges
    for (let i = 0; i < nodeCount; i++) {
        // Connect to random node in same cluster
        const clusterId = i % clusters;
        const sameCluster = i - (i % clusters) + Math.floor(Math.random() * (nodeCount / clusters));
        if (sameCluster !== i && sameCluster < nodeCount) {
            relationships.push({
                id: `s_edge_${i}_1`,
                start: `s_node_${i}`,
                end: `s_node_${sameCluster}`,
                type: "intra"
            });
        }
        
        // Sometimes connect outside
        if (Math.random() > 0.95) {
            const other = Math.floor(Math.random() * nodeCount);
            if (other !== i) {
                relationships.push({
                    id: `s_edge_${i}_2`,
                    start: `s_node_${i}`,
                    end: `s_node_${other}`,
                    type: "inter"
                });
            }
        }
    }

    const json = {
        system: "Nodges",
        metadata: { version: 4, schemaVersion: "3.0", description: "Stress Test 500 Nodes" },
        dataModel: { entities: {}, relationships: {} },
        data: { entities, relationships },
        visualMappings: { 
            defaultPresets: {
                "intra": { color: "#ffffff", thickness: 0.5 },
                "inter": { color: "#ff0000", thickness: 2.0, animation: { type: "pulse", frequency: 2.0 } }
            } 
        }
    };
    fs.writeFileSync(path.join(outDir, '109c_stress_test.json'), JSON.stringify(json, null, 2));
}

generate109a();
generate109b();
generate109c();

console.log('Examples generated successfully!');
