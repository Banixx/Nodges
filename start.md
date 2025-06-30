# Nodges 0.77 - Getting Started

Welcome to Nodges 0.77, a powerful 3D network visualization tool built with Three.js. This guide will help you get started with the application and explore its features.

## Quick Start

1. Open `index.html` in a modern web browser
2. Use the buttons on the left panel to load different network datasets:
   - Small Network
   - Medium Network
   - Large Network
   - Mega Network
   - Family Data
   - Architecture
   - Royal Family

## Navigation Controls

- **Rotate**: Click and drag with the left mouse button
- **Pan**: Click and drag with the right mouse button or hold Shift + left mouse button
- **Zoom**: Use the mouse wheel or pinch gesture on touchpads

## Features

### Node and Edge Visualization
- Multiple node shapes (cube, sphere, cylinder, custom 3D models)
- Texture mapping for nodes
- Various edge styles (solid, dashed, dotted)
- Animated edges (pulsing, flowing)
- Edge labels with 3D positioning

### Network Analysis
- Search functionality for finding specific nodes
- Neighborhood highlighting (1-hop, 2-hop, 3-hop neighbors)
- Node filtering based on properties

### User Interface
- Settings panel (right side) with tabbed interface
- Node/edge information panel
- File information panel

## Using the Settings Panel

The settings panel on the right side of the screen provides access to various configuration options:

### Data
- Options related to the loaded dataset

### Filter
- Toggle visibility of nodes based on gender (Male, Female, Non-Binary)

### View
- Toggle between icon mode and geometric shapes

### Analysis
- **Neighborhood Highlighting**: Select a node, then use these controls to highlight its neighborhood
  - Set neighborhood depth (1-3 hops)
  - Toggle dimming of nodes outside the neighborhood
  - Apply or clear highlighting
- **Edge Labels**: Configure how edge labels are displayed
  - Toggle visibility
  - Set whether labels are always visible or only when close
  - Adjust font size and visibility distance threshold

## Search Functionality

1. Enter a search term in the search box (top left)
2. Click "Search" or press Enter
3. Click on a result to focus the camera on that node

## Data Structure

Nodges visualizes network data from JSON files with the following structure:
- `metadata`: General information about the dataset
- `nodes`: Array of objects representing network nodes
- `edges`: Array of objects representing connections between nodes

For more details on the data format, see `definition_json.txt`.

## Next Steps

- Explore different datasets to understand the visualization capabilities
- Try the neighborhood highlighting feature to analyze node connections
- Use the search functionality to find specific nodes
- Experiment with different view settings and filters

Enjoy exploring your network data with Nodges 0.77!