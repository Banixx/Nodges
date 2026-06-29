const fs = require('fs');

const rawNodes = [
  { "id": "node_app", "label": "App\nfrontend entry\n[App.ts]", "file": "src/App.ts", "group": "Runtime" },
  { "id": "node_public_data", "label": "Sample Data\nseed datasets", "file": "public/data", "group": "Data/Input" },
  { "id": "node_service_container", "label": "Service Container\ncomposition root", "file": "src/core/di/ServiceContainer.ts", "group": "Core Services" },
  { "id": "node_data_parser", "label": "Data Parser\ningestion\n[DataParser.ts]", "file": "src/core/DataParser.ts", "group": "Core Services" },
  { "id": "node_state_manager", "label": "State Manager\napp state\n[StateManager.ts]", "file": "src/core/StateManager.ts", "group": "Core Services" },
  { "id": "node_event_bus", "label": "Event Bus\nevent distribution", "file": "src/core/CentralEventManager.ts", "group": "Core Services" },
  { "id": "node_mapping_engine", "label": "Mapping Engine\nvisual mapping", "file": "src/core/VisualMappingEngine.ts", "group": "Core Services" },
  { "id": "node_layout_manager", "label": "Layout Manager\ngraph layout\n[LayoutManager.ts]", "file": "src/core/LayoutManager.ts", "group": "Core Services" },
  { "id": "node_interaction_manager", "label": "Interaction Manager\ninput orchestration", "file": "src/core/InteractionManager.ts", "group": "Core Services" },
  { "id": "node_ui_manager", "label": "UI Manager\npanel coordination\n[UIManager.ts]", "file": "src/core/UIManager.ts", "group": "Core Services" },
  { "id": "node_node_manager", "label": "Node Manager\nscene nodes\n[NodeManager.ts]", "file": "src/core/NodeManager.ts", "group": "Visualization" },
  { "id": "node_edge_manager", "label": "Edge Manager\nscene edges", "file": "src/core/EdgeObjectsManager.ts", "group": "Visualization" },
  { "id": "node_layout_worker", "label": "Layout Worker\noff-thread compute\n[layout-worker.ts]", "file": "src/workers/layout-worker.ts", "group": "Visualization" },
  { "id": "node_file_panel", "label": "File Panel\nimport/export UI\n[FilePanelUI.ts]", "file": "src/ui/FilePanelUI.ts", "group": "UI/Tools" },
  { "id": "node_mapping_panel", "label": "Mapping Panel\nmapping UI\n[MappingUI.ts]", "file": "src/ui/MappingUI.ts", "group": "UI/Tools" },
  { "id": "node_view_panel", "label": "View Panel\nview controls\n[ViewPanel.ts]", "file": "src/ui/ViewPanel.ts", "group": "UI/Tools" },
  { "id": "node_info_panel", "label": "Info Panel\ninspection UI\n[InfoPanelUI.ts]", "file": "src/ui/InfoPanelUI.ts", "group": "UI/Tools" },
  { "id": "node_data_editor", "label": "Data Editor\ndataset editing\n[DataEditor.ts]", "file": "src/ui/DataEditor.ts", "group": "UI/Tools" },
  { "id": "node_import_manager", "label": "Import Manager\nfile import\n[ImportManager.ts]", "file": "src/utils/ImportManager.ts", "group": "UI/Tools" },
  { "id": "node_export_manager", "label": "Export Manager\nfile export\n[ExportManager.ts]", "file": "src/utils/ExportManager.ts", "group": "UI/Tools" },
  { "id": "node_llm_service", "label": "LLM Service\noptional AI\n[LLMService.ts]", "file": "src/utils/LLMService.ts", "group": "UI/Tools" }
];

const rawEdges = [
  { "source": "node_app", "target": "node_service_container", "label": "bootstraps" },
  { "source": "node_service_container", "target": "node_data_parser", "label": "wires" },
  { "source": "node_service_container", "target": "node_state_manager", "label": "wires" },
  { "source": "node_service_container", "target": "node_event_bus", "label": "wires" },
  { "source": "node_service_container", "target": "node_mapping_engine", "label": "wires" },
  { "source": "node_service_container", "target": "node_layout_manager", "label": "wires" },
  { "source": "node_service_container", "target": "node_node_manager", "label": "wires" },
  { "source": "node_service_container", "target": "node_edge_manager", "label": "wires" },
  { "source": "node_service_container", "target": "node_interaction_manager", "label": "wires" },
  { "source": "node_service_container", "target": "node_ui_manager", "label": "wires" },
  { "source": "node_public_data", "target": "node_import_manager", "label": "loads" },
  { "source": "node_import_manager", "target": "node_data_parser", "label": "parses" },
  { "source": "node_file_panel", "target": "node_import_manager", "label": "triggers" },
  { "source": "node_file_panel", "target": "node_export_manager", "label": "triggers" },
  { "source": "node_data_editor", "target": "node_state_manager", "label": "edits" },
  { "source": "node_state_manager", "target": "node_event_bus", "label": "publishes" },
  { "source": "node_event_bus", "target": "node_mapping_engine", "label": "updates" },
  { "source": "node_event_bus", "target": "node_layout_manager", "label": "updates" },
  { "source": "node_layout_manager", "target": "node_layout_worker", "label": "offloads" },
  { "source": "node_layout_manager", "target": "node_node_manager", "label": "positions" },
  { "source": "node_layout_manager", "target": "node_edge_manager", "label": "positions" },
  { "source": "node_mapping_engine", "target": "node_node_manager", "label": "styles" },
  { "source": "node_mapping_engine", "target": "node_edge_manager", "label": "styles" },
  { "source": "node_interaction_manager", "target": "node_event_bus", "label": "emits" },
  { "source": "node_interaction_manager", "target": "node_state_manager", "label": "mutates" },
  { "source": "node_ui_manager", "target": "node_view_panel", "label": "hosts" },
  { "source": "node_ui_manager", "target": "node_mapping_panel", "label": "hosts" },
  { "source": "node_ui_manager", "target": "node_info_panel", "label": "hosts" },
  { "source": "node_ui_manager", "target": "node_file_panel", "label": "hosts" },
  { "source": "node_ui_manager", "target": "node_data_editor", "label": "hosts" },
  { "source": "node_ui_manager", "target": "node_llm_service", "label": "optionally uses" },
  { "source": "node_ui_manager", "target": "node_interaction_manager", "label": "configures" },
  { "source": "node_interaction_manager", "target": "node_node_manager", "label": "targets" },
  { "source": "node_interaction_manager", "target": "node_edge_manager", "label": "targets" }
];

const groupCenters = {
  "Runtime": { x: 0, y: 15, z: 0 },
  "Data/Input": { x: -15, y: 5, z: 0 },
  "Core Services": { x: 0, y: 5, z: 0 },
  "Visualization": { x: 15, y: 5, z: 0 },
  "UI/Tools": { x: 0, y: -5, z: 0 }
};

const groupCounts = {};
rawNodes.forEach(n => {
  groupCounts[n.group] = (groupCounts[n.group] || 0) + 1;
});
const groupIndexes = {};

const entities = rawNodes.map((n, i) => {
  const center = groupCenters[n.group] || { x: 0, y: 0, z: 0 };
  const totalInGroup = groupCounts[n.group];
  const idx = groupIndexes[n.group] || 0;
  groupIndexes[n.group] = idx + 1;
  
  let dx = 0, dy = 0, dz = 0;
  if (totalInGroup > 1) {
    const angle = (idx / totalInGroup) * Math.PI * 2;
    const radius = Math.min(totalInGroup * 1.5, 8); // scale radius by items
    dx = Math.cos(angle) * radius;
    dz = Math.sin(angle) * radius;
  }
  
  return {
    id: n.id,
    type: "component",
    label: n.label,
    position: {
      x: parseFloat((center.x + dx).toFixed(2)),
      y: parseFloat((center.y + dy).toFixed(2)),
      z: parseFloat((center.z + dz).toFixed(2))
    },
    group: n.group,
    file: n.file
  };
});

const relationships = rawEdges.map((e, i) => {
  return {
    id: `e${i}`,
    type: "dependency",
    source: e.source,
    target: e.target,
    label: e.label
  };
});

const baseData = {
  system: "Nodges Architecture 101",
  metadata: {
    created: new Date().toISOString(),
    version: "1.0",
    description: "Architektur von Nodges"
  },
  dataModel: {
      entities: {
          component: {
              properties: {
                  group: {
                      type: "categorical"
                  }
              }
          }
      },
      relationships: {
          dependency: {
              properties: {
                  label: {
                      type: "categorical"
                  }
              }
          }
      }
  },
  visualMappings: {
    defaultPresets: {
        component: {
            color: {
                source: "group",
                function: "categorical",
                palette: "category10"
            }
        },
        dependency: {
            color: {
                source: "label",
                function: "categorical",
                palette: "category20"
            }
        }
    }
  },
  data: {
    entities: entities,
    relationships: relationships
  }
};

fs.writeFileSync("nodges_101.json", JSON.stringify(baseData, null, 2));

const plusData = JSON.parse(JSON.stringify(baseData));
plusData.system = "Nodges Architecture 101 - Plus AI Instruction";
plusData.metadata.system_instruction = "Mache dir ein eigenes, detailliertes Bild vom Code von Nodges. Lese die zugehörigen Dateien und analysiere die Projektstruktur, um ein tiefes Verständnis für die interne Funktionsweise, die Datenstrukturen und die Zusammenhänge zu erlangen, das über die bloße Architekturdarstellung hinausgeht.";

fs.writeFileSync("nodges101_plus.json", JSON.stringify(plusData, null, 2));
console.log("JSON files generated successfully!");
