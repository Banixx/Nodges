export interface EntityData {
  id: string;
  type: string;
  label: string;
  position?: { x: number; y: number; z: number };
  [key: string]: any;
}

export interface RelationshipData {
  id: string;
  type: string;
  source: string;
  target: string;
  label?: string;
  [key: string]: any;
}

export interface GraphData {
  system: string;
  metadata?: {
    description: string;
    author?: string;
    created?: string;
    modified?: string;
  };
  visualMappings?: {
    defaultPresets: {
      [type: string]: {
        color?: { params: { color: string } };
        size?: { range: [number, number] };
        thickness?: { range: [number, number] };
      };
    };
  };
  data: {
    entities: EntityData[];
    relationships: RelationshipData[];
  };
}

export interface NodeObject {
  id: string;
  mesh: THREE.Mesh;
  userData: any;
  position: THREE.Vector3;
  scale: THREE.Vector3;
}

export interface EdgeObject {
  id: string;
  mesh: THREE.Mesh;
  curve: THREE.Curve;
  material: THREE.Material;
  userData: any;
}

export interface VisualMapping {
  color?: { params: { color: string } };
  size?: { range: [number, number] };
  thickness?: { range: [number, number] };
}

export interface State {
  graphData: GraphData;
  hoveredObject: THREE.Object3D | null;
  selectedObject: THREE.Object3D | null;
  selectedObjects: Set<THREE.Object3D>;
  highlightedObjects: Set<THREE.Object3D>;
  backgroundColor: string;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  showLabelsAlways: boolean;
  showLabelsOnHover: boolean;
  activeColorScheme: string;
  devPowerPreference: 'high-performance' | 'low-power' | 'default';
  devPixelRatio: number;
  devFpsLimit: number;
}

export interface VisualMappingEngine {
  setVisualMappings(mappings: any): void;
  getVisualProperties(type: string): VisualMapping;
}

export interface NodeManager {
  updateNodes(entities: EntityData[]): void;
  clear(): void;
  dispose(): void;
}

export interface EdgeObjectsManager {
  updateEdges(relationships: RelationshipData[], entities: EntityData[]): void;
  dispose(): void;
  animate(): void;
}

export interface LayoutManager {
  applyLayout(layoutType: string, entities: EntityData[], relationships: RelationshipData[]): Promise<void>;
  stopAnimation(): void;
}

export interface HighlightManager {
  clearAllHighlights(): void;
  destroy(): void;
}

export interface InteractionManager {
  destroy(): void;
}

export interface UIManager {
  init(): void;
  updateFileInfo(name: string, nodes: number, edges: number, bounds: any): void;
  updateFps(fps: number): void;
}

export interface MinimapUI {
  updateSize(): void;
  getCanvas(): HTMLCanvasElement;
}