// Test setup file - runs before all tests
// For Three.js/logic tests, no DOM cleanup needed

// Mock requestAnimationFrame for StateManager (uses it for glow animations)
global.requestAnimationFrame = (cb: FrameRequestCallback) => {
    return setTimeout(cb, 16) as any; // ~60fps
};

global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
};

// Extend matchers if needed
// (Currently using default vitest matchers)
