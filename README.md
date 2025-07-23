# Nodges 0.90

A powerful 3D network visualization tool built with Three.js for interactive exploration of complex networks and graphs.

## Features

- **3D Visualization**: Interactive 3D network rendering with WebGL
- **Multiple Layouts**: Force-directed, hierarchical, circular, and custom algorithms
- **Interactive UI**: Click and hover interactions with dynamic info panels
- **Shadow System**: Realistic shadows for nodes and edges
- **Performance Optimized**: Adaptive quality based on network size
- **File Support**: JSON network data import/export

## Quick Start

1. **Start the server:**
   ```bash
   ./start_server.sh
   ```

2. **Open in browser:**
   ```
   http://localhost:8000
   ```

3. **Load sample data:**
   - Click on "Files" panel
   - Select from available network examples

## Project Structure

```
nodges/
├── main.js              # Core application
├── index.html           # Main interface
├── data.js              # Data loading/processing
├── src/
│   ├── core/            # Core managers
│   ├── utils/           # Utility modules
│   └── effects/         # Visual effects
├── objects/             # Node and Edge classes
├── data/examples/       # Sample network files
└── backups/             # Automatic backups
```

## Network Data Format

```json
{
  "nodes": [
    {"x": -3.5, "y": 1.2, "z": -2.8, "name": "node 1"},
    {"x": 2.8, "y": 0.5, "z": 3.2, "name": "node 2"}
  ],
  "edges": [
    {"start": 0, "end": 1, "name": "edge 1", "offset": 0}
  ]
}
```

## Development

- **Version**: 0.90
- **Technology**: Three.js, WebGL, ES6 Modules
- **Safety System**: Unicode prevention and automatic backups
- **Architecture**: Modular ES6 with reactive state management

## License

MIT License - see LICENSE file for details.