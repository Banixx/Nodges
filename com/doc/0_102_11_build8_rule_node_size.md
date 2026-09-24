# Regel-Implementierung fuer Build 8: Knotengroesse relativ zur Kantendicke

Um sicherzustellen, dass Knoten in der 3D-Visualisierung von Build 8 nicht hinter dicken Kanten verschwinden oder zu klein wirken, wurde eine Gestaltungsregel eingefuehrt.

## Regel
* **Nodes muessen immer mindestens das 1.5-fache der maximalen Kantendicke (edge thickness) gross sein.**

---

## Umsetzung und Hardening

### 1. Definition im System-Prompt (Aktiv)
In `C:/Users/ich/Desktop/code/_projects/Nodges/src/prompts/build_8_mapping_prompt.md` wurde unter den `STRIKTE REGELN` die Regel 8 hinzugefuegt:
```markdown
8. VISUELLE RELATION: Die Knotengroesse (`size` im `global_node` visualMapping) muss immer mindestens das 1.5-fache der maximalen Kantendicke (`thickness` im `global_edge` visualMapping) betragen.
```

### 2. Keine programmatische Manipulation (Revertiert)
Um unerwartete Effekte im Mapping-Panel zu vermeiden und die saubere Trennung von Datenerstellung (LLM) und visueller Darstellung (Nodges Engine/UI) zu garantieren, wurde auf eine nachtraegliche automatische Modifikation des JSON-Ergebnisses verzichtet:
* Die zuvor testweise implementierte Korrekturschleife in `generateGraphDataBuild8` (`LLMService.ts`) wurde vollstaendig entfernt.
* Die Nodges Engine bleibt somit datenneutral und fuehrt keine eigenstaendigen, intransparenten Korrekturen an den generierten Visualisierungs-Presets durch.
