# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive architecture and design documentation in `doc/`.
- Technical deep-dives for rendering logic and state management.
- Integration with external 3D tooling (FreeCAD, Blender, Studio BrickLink) in documentation plans.
- Root scripts for build-checks and automated type patching (`/build_fix`).
- Initial Glossary, Troubleshooting, and Quickstart guides to ease onboarding.

### Changed
- Major refactoring of the monolithic `App.ts` and `InteractionManager.ts` to modular handlers based on the documented Umsetzungsplan.
- Migration to strict TypeScript interfaces for Event System and State Manager.
- Implemented Zod schemas for robust validation of imported JSON graph data.
- Switch to Web Workers for calculating O(n^2) Force-Directed Layouts.

### Removed
- Legacy unstructured `assets/bericht_phase*` logs and outdated `projektanalyse` files to streamline repository information architecture.

## [0.98.0] - 2026-02-13

### Added
- NVIDIA GPU Support via `nvidia-container-toolkit` for DevContainer acceleration.
- Foundational `layout-worker` with message passing.
- Test coverage suite expansions (`vitest`).

### Fixed
- Z-Fighting issues with Node Highlights and Selection Glows.
- Memory leak in `EdgeObjectsManager` and `InstancedMesh` re-allocations.
