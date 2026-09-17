SYSTEM:
<!DOCTYPE html>
<html>

<head>
  <script type="module" src="/@vite/client"></script>

    <meta charset="UTF-8">
    <title>Nodges</title>
    <link rel="icon" type="image/png" href="/favicon-32x32.png">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    
    <!-- CSS is imported in App.ts -->
</head>

<body>


    <!-- ======================= -->
    <!-- MAIN SIDEBAR (Right)    -->
    <!-- ======================= -->
    <aside id="mainSidebar" class="main-sidebar">
        <!-- Sidebar Header -->
        <header class="sidebar-header">
            <span class="sidebar-title">Nodges</span>
            <span id="sidebarVersion" class="sidebar-version"></span>
        </header>

        <!-- Tab Navigation Container -->
        <div class="sidebar-tabs-container">
            <nav class="sidebar-tabs">
                <button class="sidebar-tab active" data-tab="tab-system" data-min-mode="simple">System</button>
                <button class="sidebar-tab" data-tab="tab-layers" data-min-mode="expert">Ebenen</button>
                <button class="sidebar-tab" data-tab="tab-files" data-min-mode="simple">Files</button>
                <button class="sidebar-tab" data-tab="tab-view" data-min-mode="simple">Ansicht</button>
                <button class="sidebar-tab" data-tab="tab-create" data-min-mode="dev">Create</button>

                <button class="sidebar-tab" data-tab="tab-dev" data-min-mode="dev">Dev</button>
                <div id="tabIndicator" class="tab-indicator"></div>
            </nav>
        </div>

        <!-- Tab Content Area -->
        <div class="sidebar-body">

            <!-- ===== SYSTEM TAB ===== -->
            <div id="tab-system" class="tab-content active">
                <section class="panel-section">
                    <h4 class="section-header">UI-Modus</h4>
                    <div class="nodges-slide-toggle">
                        <input type="radio" name="mainUiMode" id="uimode_simple" value="simple" checked>
                        <input type="radio" name="mainUiMode" id="uimode_expert" value="expert">
                        <input type="radio" name="mainUiMode" id="uimode_dev" value="dev">
                        
                        <label for="uimode_simple">Simple</label>
                        <label for="uimode_expert">Expert</label>
                        <label for="uimode_dev">Dev</label>
                        
                        <div class="nodges-slide-thumb"></div>
                    </div>
                </section>

                <section class="panel-section">
                    <h4 class="section-header">Info</h4>
                    <div class="info-row"><span class="info-label">Version:</span><span class="info-value"
                            id="fileVersion">...</span></div>
                    <div class="info-row"><span class="info-label">Schema:</span><span class="info-value"
                            id="fileSchemaVersion">-</span></div>
                    <div class="info-row"><span class="info-label">System/Datei:</span><span class="info-value"
                            id="fileFilename">-</span></div>
                    <div class="info-row"><span class="info-label">Knoten:</span><span class="info-value"
                            id="fileNodeCount">0</span></div>
                    <div class="info-row"><span class="info-label">Kanten:</span><span class="info-value"
                            id="fileEdgeCount">0</span></div>
                    <div class="info-row"><span class="info-label">FPS:</span><span class="info-value"
                            id="fileFPS">0</span></div>
                </section>

                <div id="legendContainer">
                    <!-- Populated by LegendPanel.ts -->
                </div>

                <section class="panel-section" data-min-mode="expert">
                    <h4 class="section-header">Achsenbereiche</h4>
                    <div class="info-row"><span class="info-label">X-Achse:</span><span class="info-value"
                            id="fileXAxis">-</span></div>
                    <div class="info-row"><span class="info-label">Y-Achse:</span><span class="info-value"
                            id="fileYAxis">-</span></div>
                    <div class="info-row"><span class="info-label">Z-Achse:</span><span class="info-value"
                            id="fileZAxis">-</span></div>
                </section>
            </div>

            <!-- ===== LAYERS TAB ===== -->
            <div id="tab-layers" class="tab-content">
                <section class="panel-section" style="padding: 15px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                    <div class="control-row">
                        <label for="layeringAttributeSelect" style="display: block; font-size: 0.85em; margin-bottom: 6px; color: #8899a6; font-weight: 600;">Gruppierungs-Attribut:</label>
                        <select id="layeringAttributeSelect" class="form-select" style="width: 100%; padding: 6px 10px; background: #1b2836; border: 1px solid #38444d; color: #fff; border-radius: 4px; font-size: 13px;">
                            <option value="layer">layer</option>
                            <option value="type">type</option>
                        </select>
                    </div>
                </section>

                <!-- Ebene 1 -->
                <div class="layer-control">
                    <div class="layer-header">
                        <input type="checkbox" class="nodges-toggle" id="layer1Toggle" checked>
                        <span class="layer-name">Ebene 1</span>
                        <select id="layer1ValueSelect" class="layer-value-select" style="margin-left: auto; width: 50%; padding: 4px 8px; background: #1b2836; border: 1px solid #38444d; color: #fff; border-radius: 4px; font-size: 12px;"></select>
                    </div>
                    <div class="layer-slider-container">
                        <label class="layer-slider-label">Transparenz:</label>
                        <input type="range" id="layer1Opacity" min="0" max="1" step="0.05" value="1.0" class="layer-slider">
                    </div>
                </div>

                <!-- Ebene 2 -->
                <div class="layer-control">
                    <div class="layer-header">
                        <input type="checkbox" class="nodges-toggle" id="layer2Toggle" checked>
                        <span class="layer-name">Ebene 2</span>
                        <select id="layer2ValueSelect" class="layer-value-select" style="margin-left: auto; width: 50%; padding: 4px 8px; background: #1b2836; border: 1px solid #38444d; color: #fff; border-radius: 4px; font-size: 12px;"></select>
                    </div>
                    <div class="layer-slider-container">
                        <label class="layer-slider-label">Transparenz:</label>
                        <input type="range" id="layer2Opacity" min="0" max="1" step="0.05" value="1.0" class="layer-slider">
                    </div>
                </div>

                <!-- Ebene 3 -->
                <div class="layer-control">
                    <div class="layer-header">
                        <input type="checkbox" class="nodges-toggle" id="layer3Toggle" checked>
                        <span class="layer-name">Ebene 3</span>
                        <select id="layer3ValueSelect" class="layer-value-select" style="margin-left: auto; width: 50%; padding: 4px 8px; background: #1b2836; border: 1px solid #38444d; color: #fff; border-radius: 4px; font-size: 12px;"></select>
                    </div>
                    <div class="layer-slider-container">
                        <label class="layer-slider-label">Transparenz:</label>
                        <input type="range" id="layer3Opacity" min="0" max="1" step="0.05" value="1.0" class="layer-slider">
                    </div>
                </div>
                
                <!-- Ebene 4 -->
                <div class="layer-control">
                    <div class="layer-header">
                        <input type="checkbox" class="nodges-toggle" id="layer4Toggle" checked>
                        <span class="layer-name">Ebene 4</span>
                        <select id="layer4ValueSelect" class="layer-value-select" style="margin-left: auto; width: 50%; padding: 4px 8px; background: #1b2836; border: 1px solid #38444d; color: #fff; border-radius: 4px; font-size: 12px;"></select>
                    </div>
                    <div class="layer-slider-container">
                        <label class="layer-slider-label">Transparenz:</label>
                        <input type="range" id="layer4Opacity" min="0" max="1" step="0.05" value="1.0" class="layer-slider">
                    </div>
                </div>
            </div>

            <!-- ===== FILES TAB ===== -->
            <div id="tab-files" class="tab-content">
                <div id="filePanelContent">
                    <div id="fileLoadingIndicator" class="loading-text">
                        Lade verfuegbare Dateien...
                    </div>
                </div>
            </div>

            <!-- ===== VIEW (ANSICHT) TAB ===== -->
            <div id="tab-view" class="tab-content">
                <section class="panel-section" data-min-mode="expert">
                    <h4 class="section-header">Umgebung</h4>
                    <div id="environmentContent">
                        <!-- Populated by EnvironmentPanel.ts -->
                    </div>
                </section>

                <div id="viewPanelContent">
                    <!-- Populated by ViewPanel.ts -->
                </div>

                <!-- Edge / View Controls (formerly Dev Options) -->
                <section class="panel-section" data-min-mode="dev">
                    <h4 class="section-header">Kanten & Darstellung</h4>
                    <!-- Edge Thickness Control -->
                    <div class="control-group">
                        <div class="label-row">
                            <label>Edge Thickness</label>
                            <span id="edgeThicknessValue" class="value-display">2.00</span>
                        </div>
                        <input type="range" id="edgeThicknessSlider" min="0.1" max="10.0" step="0.1" value="2.0">
                    </div>

                    <div class="control-group checkbox-row">
                        <label>Highlight Effects</label>
                        <input type="checkbox" id="highlightToggleInput" checked>
                    </div>

                    <div class="control-group">
                        <div class="label-row">
                            <label>Highlight Size</label>
                            <span id="edgeHighlightValue" class="value-display">30%</span>
                        </div>
                        <input type="range" id="edgeHighlightSlider" min="0" max="100" step="1" value="50">
                    </div>

                    <div class="control-group">
                        <div class="label-row">
                            <label>Selection Bonus</label>
                            <span id="edgeSelectionValue" class="value-display">20%</span>
                        </div>
                        <input type="range" id="edgeSelectionSlider" min="0" max="100" step="1" value="20">
                    </div>

                    <div class="control-group">
                        <div class="label-row">
                            <label>Curve Segments</label>
                            <span id="edgeSegmentsValue" class="value-display">20</span>
                        </div>
                        <input type="range" id="edgeSegmentsSlider" min="2" max="100" step="1" value="20">
                    </div>

                    <div class="control-group">
                        <div class="label-row">
                            <label>Tube Facets</label>
                            <span id="edgeRadialValue" class="value-display">8</span>
                        </div>
                        <input type="range" id="edgeRadialSlider" min="3" max="32" step="1" value="8">
                    </div>

                    <div class="control-group">
                        <div class="label-row">
                            <label>Drop Out (Curvature)</label>
                            <span id="edgeCurveValue" class="value-display">0.40</span>
                        </div>
                        <input type="range" id="edgeCurveSlider" min="0" max="100" step="1" value="7">
                    </div>

                    <div class="control-group">
                        <div class="label-row">
                            <label>Pulse Speed</label>
                            <span id="edgePulseValue" class="value-display">1.00</span>
                        </div>
                        <input type="range" id="edgePulseSlider" min="0.1" max="5.0" step="0.1" value="1.0">
                    </div>

                    <div class="control-group">
                        <label>Anim Mode</label>
                        <select id="edgeAnimModeSelect">
                            <option value="pulse">Pulse (Global)</option>
                            <option value="sequential">Sequential (Wave)</option>
                            <option value="flow">Flow (Moving Point)</option>
                            <option value="segments">Segments (Colors)</option>
                        </select>
                    </div>

                    <div class="control-group">
                        <div class="label-row">
                            <label>Opacity</label>
                            <span id="edgeOpacityValue" class="value-display">1.00</span>
                        </div>
                        <input type="range" id="edgeOpacitySlider" min="0.1" max="1.0" step="0.05" value="1.0">
                    </div>

                    <button id="resetEdgeControls" class="action-button secondary">Reset Edge Controls</button>
                </section>
            </div>

            <!-- ===== CREATE TAB ===== -->
            <div id="tab-create" class="tab-content">
                <section class="panel-section">
                    <div id="createPanelContent">
                        <p class="loading-text">Hier können neue Knoten und Kanten erstellt werden.</p>
                    </div>
                </section>
            </div>

            <!-- ===== DEV TAB ===== -->
            <div id="tab-dev" class="tab-content">
                <div id="devPanelContent">
                    <!-- Populated by DevPanel.ts -->
                </div>
            </div>

        </div><!-- /sidebar-body -->
    </aside>

    <!-- ======================= -->
    <!-- MINIMAP                 -->
    <!-- ======================= -->
    <div id="minimapContainer" class="minimap-container"></div>

    <!-- ======================= -->
    <!-- MAPPING PANEL           -->
    <!-- ======================= -->
    <div id="mappingPanelContainer" class="mapping-panel-container" data-min-mode="expert"></div>

    <!-- ======================= -->
    <!-- FLOATING INFO PANEL     -->
    <!-- (Shows on object click) -->
    <!-- ======================= -->
    <div id="infoPanel" class="floating-info-panel hidden">
        <div class="floating-panel-header">
            <h3 id="infoPanelTitle">Info</h3>
            <button id="infoPanelClose" class="panel-close-btn">&times;</button>
        </div>
        <div id="infoPanelContent" class="floating-panel-content">
            <!-- Content dynamically populated -->
        </div>
    </div>

    <script type="module" src="/src/App.ts?t=1789585348587"></script>
    <script>
        // Fetch version from package.json and display
        // Version is now handled in App.ts

        const tabsContainer = document.querySelector('.sidebar-tabs');
        const tabIndicator = document.getElementById('tabIndicator');

        // Update the position and width of the tab indicator
        function updateTabIndicator(activeTab) {
            if (!activeTab || !tabIndicator || !tabsContainer) return;
            const tabRect = activeTab.getBoundingClientRect();
            const containerRect = tabsContainer.getBoundingClientRect();
            
            // Calculate relative to the container scroll
            const left = activeTab.offsetLeft;
            const width = activeTab.offsetWidth;
            
            tabIndicator.style.left = `${left}px`;
            tabIndicator.style.width = `${width}px`;
        }

        // Convert mouse wheel scroll to tab switching
        if (tabsContainer) {
            let lastScrollTime = 0;
            tabsContainer.addEventListener('wheel', (e) => {
                e.preventDefault(); // Prevent default horizontal/vertical scroll
                
                const now = Date.now();
                // Throttle to 200ms to ensure one tick = one tab change
                if (now - lastScrollTime < 200) return;

                const scrollAmount = e.deltaY || e.deltaX;
                if (scrollAmount === 0) return;

                const tabs = Array.from(document.querySelectorAll('.sidebar-tab'));
                const activeIndex = tabs.findIndex(tab => tab.classList.contains('active'));
                
                if (activeIndex === -1) return;

                let nextIndex = activeIndex;
                if (scrollAmount > 0) {
                    // Scroll down/right -> next tab
                    nextIndex = Math.min(tabs.length - 1, activeIndex + 1);
                } else {
                    // Scroll up/left -> previous tab
                    nextIndex = Math.max(0, activeIndex - 1);
                }

                if (nextIndex !== activeIndex) {
                    lastScrollTime = now;
                    tabs[nextIndex].click();
                }
            }, { passive: false });
        }

        // Tab Switching Logic
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs and contents
                document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                // Activate clicked tab
                tab.classList.add('active');
                
                // Update indicator
                updateTabIndicator(tab);
                
                // Scroll the tab into view (centered)
                tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

                const targetId = tab.getAttribute('data-tab');
                const targetContent = document.getElementById(targetId);
                if (targetContent) targetContent.classList.add('active');
            });
        });

        // Initialize indicator position
        window.addEventListener('load', () => {
            const activeTab = document.querySelector('.sidebar-tab.active');
            if (activeTab) {
                // Small delay to ensure layout is complete
                setTimeout(() => updateTabIndicator(activeTab), 50);
            }
        });
        
        // Update indicator on window resize
        window.addEventListener('resize', () => {
            const activeTab = document.querySelector('.sidebar-tab.active');
            if (activeTab) updateTabIndicator(activeTab);
        });

        // Collapsible Sections
        document.querySelectorAll('.section-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);
                const arrow = toggle.querySelector('.toggle-arrow');
                if (targetContent) {
                    targetContent.classList.toggle('collapsed');
                    if (arrow) {
                        arrow.textContent = targetContent.classList.contains('collapsed') ? '▸' : '▾';
                    }
                }
            });
        });
    </script>
</body>

</html>
=== ZIEL-STRUKTUR (Beispiel) ===
Dein JSON MUSS exakt diese Top-Level-Struktur haben:
{
  "system": "<Thema>",
  "metadata": {
    "schemaVersion": "5.0",
    "description": "...",
    "competencyQuestions": ["...", "..."]
  },
  "dataModel": {
    "entities": {
      "<TypName>": { "properties": { "<propName>": { "type": "continuous", "range": [0, 100] }, "position": { "type": "spatial" } } }
    },
    "relationships": {
      "<KantenTyp>": { "properties": {} }
    }
  },
  "data": {
    "entities": [
      { 
        "id": "unique_id", 
        "type": "<TypName>", 
        "label": "...", 
        "<propName>": 42, 
        "position": { "x": 0, "y": 0, "z": 0 },
        "temporal": {
          "validFrom": 1900,
          "validTo": 1950,
          "history": [
            { "timestamp": 1920, "changes": { "<propName>": 80 } }
          ]
        }
      }
    ],
    "relationships": [
      { 
        "id": "rel_1", 
        "type": "<KantenTyp>", 
        "source": "id_a", 
        "target": "id_b", 
        "label": "...",
        "temporal": {
          "validFrom": 1900,
          "validTo": 1950
        }
      }
    ]
  },
  "visualMappings": {
    "defaultPresets": {
      "global_node": {
        "size": { "source": "<propName>", "function": "linear", "range": [0.5, 3] },
        "color": { "source": "kategorie", "function": "categorical" },
        "geometry": { "source": "constant", "function": "constant", "params": { "geometry": "sphere" } },
        "position": { "source": "position", "function": "constant" }
      },
      "global_edge": {
        "color": { "source": "type", "function": "categorical" },
        "thickness": { "source": "constant", "function": "constant", "params": { "value": 0.1 } }
      }
    }
  }
}
WICHTIG: "system", "metadata", "data" (mit entities+relationships Array) und "visualMappings" sind PFLICHT-Felder!
=================================

USER:
erstelle ein netzwerk mit den entitäten und relationen

=== BELEGTER LIGHTRAG-QUELLENKONTEXT ===
NEU EINGESPEISTE QUELLEN:
=== QUELLE: 1_informatiksicherheit_sgs_142_21_stand_2004.pdf (PDF, 8 Seiten) ===
[Seite 1]
Gesetzessammlung des Kantons St.Gallen   142.21
Verordnung
über die Informatiksicherheit
vom 24. Februar 2004 (Stand 1. März 2004)
Die Regierung des Kantons St.Gallen
erlässt
in Ausführung von Art.   95 des Staatsverwaltungsgesetzes vom 16.   Juni 1994 1
als Verordnung: 2
I. Allgemeine Bestimmungen   (1.)
Art. 1   Geltungsbereich
1   Diese Verordnung gilt für die Staatsverwaltung nach Art.   1 des Staatsverwal -
tungsgesetzes vom 16.   Juni 1994 3 , ausgenommen die selbständigen öffentlich-
rechtlichen Anstalten.
2   Sie wird auf Gerichte und andere Justizbehörden sachgemäss angewendet, soweit
diese nicht richterlich handeln.
Art. 2   Grundsatz
1   Informatiksysteme werden durch angemessene organisatorische und technische
Massnahmen vor äusseren Einwirkungen und unbefugten Zugriffen geschützt.
Art. 3   Begriffe
1   Folgende Begriffe bedeuten:
a)   Informatiksysteme: Geräte und Einrichtungen sowie die dazugehörende In -
frastruktur, Betriebssoftware und die Informatikanwendungen, die zur elek -
tronischen Bearbeitung von Daten eingesetzt werden, einschliesslich der bear -
beiteten Daten.
1   sGS   140.1 .
2   Im Amtsblatt veröffentlicht am 8.   März 2004, ABl 2004, 609; in Vollzug ab 1.   März 2004.
3   sGS   140.1 .
nGS 39-29

[Seite 2]
142.21
b)   Informatikanwendungen: Programme, welche die Nutzung von Informatik -
systemen für die Erfüllung oder die Unterstützung bestimmter Aufgaben er -
möglichen.
c)   Daten: Alle digitalen Informationen, die mit Informatiksystemen bearbeitet
werden.
d)   Ereignis: Verletzung der Informatiksicherheit, die zu einem finanziellen Scha -
den oder einem Imageverlust führt oder eine massive Verminderung der Ver -
fügbarkeit von betroffenen Informatiksystemen zur Folge hat.
e)   Normalbetrieb: Betrieb der Informatiksysteme im Normalfall.
f)   Notbetrieb: Betrieb der betroffenen Informatiksysteme nach dem Eintritt ei -
nes Ereignisses.
Art. 4   Verantwortlichkeiten
1   Die Konferenz der Departementsinformatikverantwortlichen legt die Sicherheits -
massnahmen, abgestuft nach den Risiken, in einem Massnahmenkatalog fest. Die
Sicherheitsmassnahmen dienen der Reduktion der Risiken.
2   Die Ämter beurteilen die Risiken, legen die Sicherheitsstufen fest, ermitteln die
zu treffenden Sicherheitsmassnahmen und sorgen für deren Umsetzung.
3   Departemente und Dienst für Informatikplanung kontrollieren die Einstufung
der Informatiksysteme und -anwendungen.
Art. 5   Unterstützung
1   Departementsinformatikverantwortliche und Dienst für Informatikplanung be -
raten die Ämter bei der Risikobeurteilung, bei der Festlegung der Sicherheitsstu -
fen, bei der Ermittlung der Sicherheitsmassnahmen sowie bei deren Umsetzung
und Überprüfung.
II. Sicherheitsstufen und Sicherheitsmassnahmen   (2.)
Art. 6   Risikobeurteilung
1   Die Ämter legen für ihre Informatiksysteme und -anwendungen je einzeln die
Gefährdung fest, indem sie die damit verwalteten Daten klassifizieren.
2   Sie berücksichtigen die Risiken aufgrund unvorsichtigen oder böswilligen Ver -
haltens von Mitarbeitenden und Aussenstehenden, aufgrund technischer Mängel
an Geräten und Gebäuden sowie aufgrund von Feuer und Elementarereignissen.
2

[Seite 3]
142.21
Art. 7   Klassifizierung
a) Vertraulichkeit
1   Als «geheim» gelten Daten, wenn es sich um besonders schützenswerte Perso -
nendaten, um Persönlichkeitsprofile, um Daten, deren Missbrauch eine betroffene
Person in gesellschaftlicher und wirtschaftlicher Hinsicht erheblich benachteiligen,
oder um vertraglich geschützte Daten handelt.
2   Als «vertraulich» gelten Daten, wenn es sich um Personendaten, um Daten, de -
ren Missbrauch eine betroffene Person in gesellschaftlicher und wirtschaftlicher
Hinsicht benachteiligen, um Daten von finanzieller Relevanz oder um Daten han -
delt, für die eine Archivierungspflicht besteht.
3   Alle anderen Daten werden bezüglich Vertraulichkeit als nicht klassifiziert einge -
stuft.
Art. 8   b) Verfügbarkeit
1   Die Anforderung «hohe Verfügbarkeit» wird an die Daten gestellt, deren Nicht -
verfügbarkeit Leben gefährdet oder deren Bedeutung für die Aufgabenerfüllung so
gross ist, dass die Verfügbarkeit auf einem entsprechenden Informatiksystem in -
nert eines Tages wiederhergestellt werden muss. An Daten, deren Wiederbeschaf -
fung nicht möglich ist und deren Verlust einen grossen finanziellen Schaden oder
einen Imageschaden in der Öffentlichkeit verursacht, wird dieselbe Anforderung
an die Verfügbarkeit gestellt.
2   Die Anforderung «mittlere Verfügbarkeit» wird an die Daten gestellt, deren Be -
deutung für die Aufgabenerfüllung so gross ist, dass die Verfügbarkeit innert drei
Tagen auf einem   entsprechenden   Informatiksystem   wiederhergestellt   werden
muss. An Daten, deren Wiederbeschaffung möglich ist, deren Verlust aber einen
mittleren finanziellen Schaden oder einen Imageschaden in der Verwaltung verur -
sacht, wird dieselbe Anforderung an die Verfügbarkeit gestellt.
3   Alle anderen Daten werden bezüglich Verfügbarkeit als nicht klassifiziert einge -
stuft.
Art. 9   Sicherheitsstufen
1   Bei der Einstufung «geheim» bzw. «hohe Verfügbarkeit» wird ein hoher Schutz
für die Informatiksysteme und -anwendungen gewährleistet.
2   Bei der Einstufung «vertraulich» bzw. «mittlere Verfügbarkeit» wird ein mittlerer
Schutz für die Informatiksysteme und -anwendungen gewährleistet.
3   Werden die Daten als nicht klassifiziert eingestuft, wird ein Grundschutz für die
Informatiksysteme und -anwendungen gewährleistet.
3

[Seite 4]
142.21
Art. 10   Massnahmenkatalog
1   Ein Massnahmenkatalog legt nach der Klassifizierung der Daten die Informatik-
Sicherheitsmassnahmen für die Informatiksysteme und -anwendungen fest bezüg -
lich:
a)   Verhinderung einer unbefugten Kenntnisnahme von Daten (Vertraulichkeit);
b)   Verhinderung einer unbefugten Veränderung von Daten oder Zugriffsrechten
(Integrität und Authentizität);
c)   höchstzulässiger Dauer eines Ausfalls (Verfügbarkeit).
2   Die Konferenz der Departementsinformatikverantwortlichen ist für Erstellung
und Nachführung des Massnahmenkatalogs zuständig.
III. Organisation   (3.)
Art. 11   Informatik-Sicherheitsorganisation der Ämter
1   Die Ämter bestimmen eine Informatik-Sicherheitsorganisation.
2   Die nach der Informatik-Sicherheitsorganisation zuständige Person:
a)   trifft die erforderlichen Vorsorgemassnahmen;
b)   stellt nach dem Eintritt eines Ereignisses die Geschäftsfortführung mit Hilfe
der Informatiksysteme und deren Rückführung in den Normalbetrieb sicher.
Art. 12   Amtsübergreifende Koordination
1   Der Departementsinformatikverantwortliche sorgt für die amtsübergreifende
Koordination innerhalb des Departementes bzw. der Staatskanzlei.
Art. 13   Kantonaler Informatik-Sicherheitsbeauftragter
1   Der Dienst für Informatikplanung sorgt für die departementsübergreifende Ko -
ordination. Er bestimmt hiefür einen kantonalen Informatik-Sicherheitsbeauftrag -
ten.
2   Der kantonale Informatik-Sicherheits-Beauftragte ist sowohl im Normalbetrieb
als auch im Notbetrieb im Einsatz.
Art. 14   Teilstab Informatik
1   Der kantonale Führungsstab bestimmt einen Teilstab Informatik.
2   Der Teilstab Informatik wird bei Grossereignissen, Notlagen und Katastrophen
eingesetzt, wenn die Informatiksicherheit gefährdet ist.
4

[Seite 5]
142.21
IV. Umsetzung   (4.)
Art. 15   Bestehende Informatiksysteme
1   Die Ämter stufen bestehende Informatiksysteme und -anwendungen gemäss der
Klassifizierung der Daten ein und sorgen für die Umsetzung der erforderlichen Si -
cherheitsmassnahmen.
Art. 16   Einführung neuer Informatiksysteme
1   Bei Neu- oder Ersatzbeschaffungen von Informatiksystemen und -anwendungen
legen die Ämter die erforderlichen Informatik-Sicherheitsmassnahmen im Rah -
men der Einführungsprojekte fest und setzen sie um.
Art. 17   Instruktion des Personals
1   Die Ämter informieren die Mitarbeitenden über die Sicherheitsmassnahmen, die
sie zu beachten haben.
2   Sie sorgen für die Ausbildung.
V. Datenverarbeitung ausserhalb des Amtes   (5.)
Art. 18   Zusammenarbeit mehrerer Ämter
1   Wenn ein Amt Daten durch andere Ämter bearbeiten lässt oder sie mit diesen
austauscht, werden die Sicherheitsstufen und -massnahmen sowie die Verantwort -
lichkeiten bei der Umsetzung gemeinsam festgelegt.
Art. 19   Zusammenarbeit mit Dritten
1   Wenn ein Amt Daten durch Stellen, welche dieser Verordnung nicht unterste -
hen, bearbeiten lässt, wird im Zusammenarbeitsvertrag vereinbart, welche Mass -
nahmen der Beauftragte zu treffen hat und wie ihre Einhaltung kontrolliert wird.
Art. 20   Datenaustausch über öffentliche Netze
1   Der Datenaustausch über öffentliche Netze ist nur über gesicherte Zugangs -
punkte zulässig. Als öffentlich gelten alle Netze ausserhalb des Kommunikations -
netzes KOMSG des Kantons.
2   Der Zugriff von öffentlichen Netzen auf das kantonsinterne Netz erfolgt über die
vom Netzbetreiber bereitgestellten gesicherten Netzübergänge.
3   Der Netzbetreiber kann Ausnahmen bewilligen.
5

[Seite 6]
142.21
Art. 21   Verwaltungsexterne Informatikarbeitsplätze
1   Unter welchen Voraussetzungen die Bearbeitung von Daten ausserhalb der
Räumlichkeiten des Amtes und die Verwendung von Daten auf privaten Geräten
zulässig ist, wird in einer Dienstanweisung geregelt.
VI. Überprüfung der Informatik-Sicherheitsmassnahmen   (6.)
Art. 22   Amtsinterne Überprüfung
1   Die Ämter überprüfen periodisch Einhaltung und Angemessenheit der Infor -
matik-Sicherheitsmassnahmen.
2   Ändern Aufgaben,   Organisation   oder   eingesetzte   Informatiksysteme oder   -
anwendungen eines Amtes, überprüfen sie die Sicherheitsstufen und Schutzziele
sowie die Angemessenheit der Informatik-Sicherheitsmassnahmen.
Art. 23   Kontrolle und Test
1   Bei Informatiksystemen und -anwendungen mit der Einstufung «hohe Verfüg -
barkeit» bzw. «geheim» lassen die Ämter die Informatik-Sicherheitsmassnahmen
periodisch durch unabhängige interne oder externe Stellen überprüfen.
2   Der kantonale Informatik-Sicherheitsbeauftragte kann Prüfungen stichproben -
weise veranlassen.
3   Bei Informatiksystemen und -anwendungen mit der Einstufung «hohe Verfüg -
barkeit» wird ein Notfallkonzept erstellt und periodisch getestet.
Schlussbestimmungen   (VII.)
Art. 24   Aufhebung bisherigen Rechts
1   Die Verordnung über die Abteilung für Datenverarbeitung und Organisation
vom 22.   April 1975 4   wird aufgehoben.
Art. 25   Übergangsbestimmung
1   Für die bestehenden Informatiksysteme und -anwendungen beurteilen die Ämter
innerhalb von zwei Jahren nach Vollzugsbeginn dieser Verordnung die Risiken
und legen die Sicherheitsstufen, die Informatik-Sicherheitsmassnahmen sowie den
Zeitplan ihrer Umsetzung fest.
4   nGS 10–45 (sGS 141.7).
6

[Seite 7]
142.21
Art. 26   Vollzugsbeginn
1   Dieser Erlass wird ab 1.   März 2004 angewendet.
7

[Seite 8]
142.21
* Änderungstabelle - Nach Bestimmung
Bestimmung   Änderungstyp   nGS-Fundstelle   Erlassdatum   Vollzugsbeginn
Erlass   Grunderlass   39-29   24.02.2004   01.03.2004
* Änderungstabelle - Nach Erlassdatum
Erlassdatum   Vollzugsbeginn   Bestimmung   Änderungstyp   nGS-Fundstelle
24.02.2004   01.03.2004   Erlass   Grunderlass   39-29
8
=== ENDE QUELLE: 1_informatiksicherheit_sgs_142_21_stand_2004.pdf ===

LIGHTRAG-ANTWORT:
Sorry, I'm not able to provide an answer to that question.[no-context]

EXTRAHIERTER QUELLENGRAPH:
{
  "entities": [
    {
      "id": "lightrag_res",
      "label": "Liefere die fuer dieses N",
      "type": "concept"
    }
  ],
  "relationships": []
}

Nutze fuer Knoten und Kanten ausschliesslich Fakten aus diesem Quellenkontext. Erfinde keine zusaetzlichen Entitaeten oder Beziehungen.

WICHTIG: Verwende fuer das Feld 'relation' (Kanten/Beziehungen) AUSSCHLIESSLICH einen der folgenden erlaubten Begriffe aus dem aktiven Relation Set: [gilt für, werden durch geschützt, bedeuten, legen fest, beurteilen, kontrollieren, beraten, legen für fest, gelten, gelten, gelten, gestellt, gestellt, gestellt, gewährleistet, gewährleistet, gewährleistet, legt fest, sorgt für, sorgt für]. Freie Erfindungen oder kommagetrennte Aufzaehlungen sind strikt verboten.