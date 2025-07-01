# 🧪 Testing Instructions - Performance Fixes Validation

## 🚀 Server Status
✅ **Server läuft auf:** http://localhost:8080

## 📋 Test-Checkliste

### 1. **Memory Leak Test** 🔥
**Ziel:** Validieren, dass Edge-Geometrie-Cache ordnungsgemäß geleert wird

**Schritte:**
1. Öffne http://localhost:8080 im Browser
2. Öffne Developer Tools (F12) → Console
3. Führe aus: `test_performance_fixes.js` laden
4. Führe aus: `performanceTests.memoryLeak()`

**Erwartetes Ergebnis:**
```
✅ Edge Cache wird ordnungsgemäß geleert
```

### 2. **Animation Performance Test** ⚡
**Ziel:** Messen der optimierten Animation-Loop Performance

**Schritte:**
1. Lade ein großes Netzwerk: Klicke "Großes Netzwerk"
2. In Console: `performanceTests.animation()`
3. Beobachte FPS-Werte

**Erwartetes Ergebnis:**
```
✅ Optimierte Animation-Loop: <5ms pro Frame
✅ Geschätzte FPS: >60
```

### 3. **Edge Settings Safety Test** 🛡️
**Ziel:** Testen der Fallback-Mechanismen

**Schritte:**
1. In Console: `performanceTests.edgeSettings()`
2. Beobachte, ob Fallback-Werte korrekt funktionieren

**Erwartetes Ergebnis:**
```
✅ Fallback-Werte funktionieren korrekt
```

### 4. **Layout Manager Error Handling** 🔧
**Ziel:** Validieren der robusten Error-Recovery

**Schritte:**
1. Klicke "🎯 Layout Algorithmen" Button
2. In Console: `performanceTests.layoutManager()`
3. Teste ungültige Layout-Parameter

**Erwartetes Ergebnis:**
```
✅ Layout Manager Error Handling funktioniert
✅ isAnimating Flag wurde korrekt zurückgesetzt
```

### 5. **Performance Monitoring** 📊
**Ziel:** Aktuelle Performance-Metriken überprüfen

**Schritte:**
1. In Console: `performanceTests.monitoring()`
2. Analysiere die Performance-Statistiken

**Erwartetes Ergebnis:**
```
📊 Current Performance Stats:
- FPS: >30
- Frame Time: <33ms
- Memory Usage: Stabil
```

## 🎯 Vollständiger Test-Durchlauf

### Automatisierte Tests:
```javascript
// In Browser Console ausführen:
performanceTests.runAll()
```

### Manuelle Tests:

#### Test A: Memory Stress Test
1. **Mehrfacher Netzwerk-Wechsel:**
   - Klicke 5x zwischen "Kleines Netzwerk" und "Großes Netzwerk"
   - Beobachte Memory-Usage in Developer Tools → Performance

2. **Cache-Validierung:**
   ```javascript
   // Vor dem Test
   console.log('Edge Cache Size:', Edge.geometryCache.size);
   
   // Nach Netzwerk-Wechsel
   console.log('Edge Cache Size:', Edge.geometryCache.size);
   ```

#### Test B: Animation Performance
1. **Lade Mega Netzwerk:**
   - Klicke "Mega Netzwerk"
   - Beobachte FPS in Performance Tab

2. **Animation-Test:**
   ```javascript
   // Messe Animation-Performance
   console.time('Animation Test');
   setTimeout(() => console.timeEnd('Animation Test'), 5000);
   ```

#### Test C: Layout System Stress Test
1. **Mehrfache Layout-Anwendungen:**
   - Öffne Layout-Panel
   - Wende verschiedene Layouts schnell hintereinander an
   - Teste Abbruch-Funktionalität

2. **Error-Recovery:**
   ```javascript
   // Teste Layout-Manager Robustheit
   layoutManager.applyLayout('invalid', [], [])
     .catch(() => console.log('Error handled correctly'));
   ```

## 📈 Performance-Benchmarks

### Vor den Fixes:
- **Memory:** Unbegrenztes Cache-Wachstum
- **Animation:** scene.traverse() für alle Objekte
- **FPS:** 15-30 bei großen Netzwerken
- **Stabilität:** Gelegentliche Crashes

### Nach den Fixes (Zielwerte):
- **Memory:** Stabiler Cache (< 50MB)
- **Animation:** Nur aktive Edges
- **FPS:** 30-60 bei großen Netzwerken  
- **Stabilität:** Keine Crashes

## 🔍 Debugging-Tipps

### Performance Issues:
```javascript
// Performance-Stats anzeigen
performanceOptimizer.getPerformanceStats()

// Memory-Usage überwachen
console.log('Memory:', performance.memory)

// FPS messen
let fps = 0;
setInterval(() => {
    console.log('FPS:', fps);
    fps = 0;
}, 1000);
```

### Memory Leaks:
```javascript
// Cache-Größen überwachen
console.log('Node Cache:', Node.geometryCache.size);
console.log('Edge Cache:', Edge.geometryCache.size);
console.log('Animated Edges:', animatedEdges.length);
```

### Animation Performance:
```javascript
// Animation-Loop Performance
let frameCount = 0;
const startTime = performance.now();

function measurePerformance() {
    frameCount++;
    if (frameCount % 60 === 0) {
        const elapsed = performance.now() - startTime;
        console.log('Avg Frame Time:', elapsed / frameCount);
    }
    requestAnimationFrame(measurePerformance);
}
measurePerformance();
```

## ✅ Success Criteria

### Memory Test:
- [ ] Edge Cache wird nach Netzwerk-Wechsel geleert
- [ ] Memory-Usage bleibt unter 100MB
- [ ] Keine Memory-Leaks nach 10 Netzwerk-Wechseln

### Performance Test:
- [ ] FPS > 30 bei großen Netzwerken
- [ ] Frame Time < 33ms
- [ ] Animation-Loop optimiert (nur aktive Edges)

### Stability Test:
- [ ] Keine Runtime-Fehler bei Edge-Loading
- [ ] Layout-Manager Error-Recovery funktioniert
- [ ] Robuste Fallback-Mechanismen

### User Experience:
- [ ] Flüssige Animationen
- [ ] Responsive UI auch bei großen Netzwerken
- [ ] Keine "hängenden" Layout-Operationen

## 🚨 Bekannte Issues (falls auftreten)

1. **Edge Cache nicht geleert:** Prüfe clearNetwork() Implementierung
2. **Hohe Frame Times:** Prüfe animatedEdges Liste
3. **Layout-Manager hängt:** Prüfe Error-Handling im finally-Block
4. **Runtime-Fehler:** Prüfe edgeSettings Fallback-Werte

## 📞 Support

Bei Problemen:
1. Prüfe Browser Console auf Fehler
2. Validiere Server-Status (http://localhost:8080)
3. Teste mit verschiedenen Netzwerk-Größen
4. Dokumentiere Performance-Metriken