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

    <script type="module" src="/src/App.ts?t=1790195222597"></script>
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
erfasse die protagonisten udn ihre verhältnisse untereinander. ebenfalsl ebenede des verwandschaftsgrahpes erfassen beziehung und derrren intensität zwischen den protagonisten muss multible erfasst werden.

=== BELEGTER LIGHTRAG-QUELLENKONTEXT ===
NEU EINGESPEISTE QUELLEN:
Gesammelte Werke in dreizehn Bänden

Band I





Erstes Kapitel


Erster Teil




* * *



»Was ist das. – Was – ist das …«

»Je, den Düwel ook, c'est la question, ma très chère demoiselle!«

Die Konsulin Buddenbrook, neben ihrer Schwiegermutter auf dem geradlinigen, weißlackierten und mit einem goldenen Löwenkopf verzierten Sofa, dessen Polster hellgelb überzogen waren, warf einen Blick auf ihren Gatten, der in einem Armsessel bei ihr saß, und kam ihrer kleinen Tochter zu Hilfe, die der Großvater am Fenster auf den Knien hielt.

»Tony!« sagte sie, »ich glaube, daß mich Gott –«

Und die kleine Antonie, achtjährig und zartgebaut, in einem Kleidchen aus ganz leichter changierender Seide, den hübschen Blondkopf ein wenig vom Gesichte des Großvaters abgewandt, blickte aus ihren graublauen Augen angestrengt nachdenkend und ohne etwas zu sehen ins Zimmer hinein, wiederholte noch einmal: »Was ist das«, sprach darauf langsam: »Ich glaube, daß mich Gott«, fügte, während ihr Gesicht sich aufklärte, rasch hinzu: »– geschaffen hat samt allen Kreaturen«, war plötzlich auf glatte Bahn geraten und schnurrte nun, glückstrahlend und unaufhaltsam, den ganzen Artikel daher, getreu nach dem Katechismus, wie er soeben, Anno 1835, unter Genehmigung eines hohen und wohlweisen Senates, neu revidiert herausgegeben war. Wenn man im Gange war, dachte sie, war es ein Gefühl, wie wenn man im Winter auf dem kleinen Handschlitten mit den Brüdern den Jerusalemsberg hinunterfuhr: es vergingen einem geradezu die Gedanken dabei, und man konnte nicht einhalten, wenn man auch wollte.

»Dazu Kleider und Schuhe«, sprach sie, »Essen und Trinken, Haus und Hof, Weib und Kind, Acker und Vieh …« Bei diesen Worten aber brach der alte Monsieur Johann Buddenbrook einfach in Gelächter aus, in sein helles, verkniffenes Kichern, das er heimlich in Bereitschaft gehalten hatte. Er lachte vor Vergnügen, sich über den Katechismus mokieren zu können, und hatte wahrscheinlich nur zu diesem Zwecke das kleine Examen vorgenommen. Er erkundigte sich nach Tony's Acker und Vieh, fragte, wieviel sie für den Sack Weizen nähme, und erbot sich, Geschäfte mit ihr zu machen. Sein rundes, rosig überhauchtes und wohlmeinendes Gesicht, dem er beim besten Willen keinen Ausdruck von Bosheit zu geben vermochte, wurde von schneeweiß gepudertem Haar eingerahmt, und etwas wie ein ganz leise angedeutetes Zöpflein fiel auf den breiten Kragen seines mausgrauen Rockes hinab. Er war, mit seinen siebenzig Jahren, der Mode seiner Jugend nicht untreu geworden; nur auf den Tressenbesatz zwischen den Knöpfen und den großen Taschen hatte er verzichtet, aber niemals im Leben hatte er lange Beinkleider getragen. Sein Kinn ruhte breit, doppelt und mit einem Ausdruck von Behaglichkeit auf dem weißen Spitzenjabot.

Alle hatten in sein Lachen eingestimmt, hauptsächlich aus Ehrerbietung gegen das Familienoberhaupt. Madame Antoinette Buddenbrook, geborene Duchamps, kicherte in genau derselben Weise wie ihr Gatte. Sie war eine korpulente Dame mit dicken weißen Locken über den Ohren, einem schwarz und hellgrau gestreiften Kleide ohne Schmuck, das Einfachheit und Bescheidenheit verriet, und mit noch immer schönen und weißen Händen, in denen sie einen kleinen, sammetnen Pompadour auf dem Schoße hielt. Ihre Gesichtszüge waren im Laufe der Jahre auf wunderliche Weise denjenigen ihres Gatten ähnlich geworden. Nur der Schnitt und die lebhafte Dunkelheit ihrer Augen redeten ein wenig von ihrer halb romanischen Herkunft; sie stammte großväterlicherseits aus einer französisch-schweizerischen Familie und war eine geborene Hamburgerin.

Ihre Schwiegertochter, die Konsulin Elisabeth Buddenbrook, eine geborene Kröger, lachte das Kröger'sche Lachen, das mit einem pruschenden Lippenlaut begann, und bei dem sie das Kinn auf die Brust drückte. Sie war, wie alle Krögers, eine äußerst elegante Erscheinung, und war sie auch keine Schönheit zu nennen, so gab sie doch mit ihrer hellen und besonnenen Stimme, ihren ruhigen, sicheren und sanften Bewegungen aller Welt ein Gefühl von Klarheit und Vertrauen. Ihrem rötlichen Haar, das auf der Höhe des Kopfes zu einer kleinen Krone gewunden und in breiten künstlichen Locken über die Ohren frisiert war, entsprach ein außerordentlich zartweißer Teint mit vereinzelten kleinen Sommersprossen. Das Charakteristische an ihrem Gesicht mit der etwas zu langen Nase und dem kleinen Munde war, daß zwischen Unterlippe und Kinn sich durchaus keine Vertiefung befand. Ihr kurzes Mieder mit hochgepufften Ärmeln, an das sich ein enger Rock aus duftiger, hellgeblümter Seide schloß, ließ einen Hals von vollendeter Schönheit frei, geschmückt mit einem Atlasband, an dem eine Komposition von großen Brillanten flimmerte.

Der Konsul beugte sich mit einer etwas nervösen Bewegung im Sessel vornüber. Er trug einen zimmetfarbenen Rock mit breiten Aufschlägen und keulenförmigen Ärmeln, die sich erst unterhalb des Gelenkes eng um die Hand schlossen. Seine anschließenden Beinkleider bestanden aus einem weißen, waschbaren Stoff und waren an den Außenseiten mit schwarzen Streifen versehen. Um die steifen Vatermörder, in die sich sein Kinn schmiegte, war die seidene Krawatte geschlungen, die dick und breit den ganzen Ausschnitt der buntfarbigen Weste ausfüllte … Er hatte die ein wenig tiefliegenden, blauen und aufmerksamen Augen seines Vaters, wenn ihr Ausdruck auch vielleicht träumerischer war; aber seine Gesichtszüge waren ernster und schärfer, seine Nase sprang stark und gebogen hervor, und die Wangen, bis zu deren Mitte blonde, lockige Bartstreifen liefen, waren viel weniger voll als die des Alten.

Madame Buddenbrook wandte sich an ihre Schwiegertochter, drückte mit einer Hand ihren Arm, sah ihr kichernd in den Schoß und sagte:

»Immer der nämliche, mon vieux, Bethsy …?« »Immer« sprach sie wie »Ümmer« aus.

Die Konsulin drohte nur schweigend mit ihrer zarten Hand, so daß ihr goldenes Armband leise klirrte; und dann vollführte sie eine ihr eigentümliche Handbewegung vom Mundwinkel zur Frisur hinauf, als ob sie ein loses Haar zurückstriche, das sich dorthin verirrt hatte.

Der Konsul aber sagte mit einem Gemisch von entgegenkommendem Lächeln und Vorwurf in der Stimme:

»Aber Vater, Sie belustigen sich wieder einmal über das Heiligste!« …

Man saß im ›Landschaftszimmer‹, im ersten Stockwerk des weitläufigen alten Hauses in der Mengstraße, das die Firma ›Johann Buddenbrook‹ vor einiger Zeit käuflich erworben hatte und das die Familie noch nicht lange bewohnte. Die starken und elastischen Tapeten, die von den Mauern durch einen leeren Raum getrennt waren, zeigten umfangreiche Landschaften, zartfarbig wie der dünne Teppich, der den Fußboden bedeckte, Idylle im Geschmack des achtzehnten Jahrhunderts, mit fröhlichen Winzern, emsigen Ackersleuten, nett bebänderten Schäferinnen, die reinliche Lämmer am Rande spiegelnden Wassers im Schoße hielten oder sich mit zärtlichen Schäfern küßten … Ein gelblicher Sonnenuntergang herrschte meistens auf diesen Bildern, mit dem der gelbe Überzug der weißlackierten Möbel und die gelbseidenen Gardinen vor den beiden Fenstern übereinstimmten.

Im Verhältnis zu der Größe des Zimmers waren die Möbel nicht zahlreich. Der runde Tisch mit den dünnen, geraden und leicht mit Gold ornamentierten Beinen stand nicht vor dem Sofa, sondern an der entgegengesetzten Wand, dem kleinen Harmonium gegenüber, auf dessen Deckel ein Flötenbehälter lag. Außer den regelmäßig an den Wänden verteilten, steifen Armstühlen gab es nur noch einen kleinen Nähtisch am Fenster und, dem Sofa gegenüber, einen zerbrechlichen Luxus-Sekretär, bedeckt mit Nippes.

Durch eine Glastür, den Fenstern gegenüber, blickte man in das Halbdunkel einer Säulenhalle hinaus, während sich linker Hand vom Eintretenden die hohe, weiße Flügeltür zum Speisesaale befand. An der anderen Wand aber knisterte, in einer halbkreisförmigen Nische und hinter einer kunstvoll durchbrochenen Tür aus blankem Schmiedeeisen, der Ofen.

Denn es war frühzeitig kalt geworden. Draußen, jenseits der Straße, war schon jetzt, um die Mitte des Oktober, das Laub der kleinen Linden vergilbt, die den Marienkirchhof umstanden, um die mächtigen gotischen Ecken und Winkel der Kirche pfiff der Wind, und ein feiner, kalter Regen ging hernieder. Madame Buddenbrook, der Älteren, zuliebe hatte man die doppelten Fenster schon eingesetzt.

Es war Donnerstag, der Tag, an dem ordnungsmäßig jede zweite Woche die Familie zusammenkam; heute aber hatte man, außer den in der Stadt ansässigen Familiengliedern, auch ein paar gute Hausfreunde auf ein ganz einfaches Mittagbrot gebeten, und man saß nun, gegen vier Uhr nachmittags, in der sinkenden Dämmerung und erwartete die Gäste …

Die kleine Antonie hatte sich in ihrer Schlittenfahrt durch den Großvater nicht stören lassen, sondern hatte nur schmollend die immer ein bißchen hervorstehende Oberlippe noch weiter über die untere geschoben. Jetzt war sie am Fuße des ›Jerusalemsberges‹ angelangt; aber unfähig, der glatten Fahrt plötzlich Einhalt zu tun, schoß sie noch ein Stück über das Ziel hinaus …

»Amen«, sagte sie, »ich weiß was, Großvater!«

»Tiens! Sie weiß was!« rief der alte Herr und tat, als ob ihn die Neugier im ganzen Körper plage. »Hast du gehört, Mama? Sie weiß was! Kann mir denn niemand sagen …«

»Wenn es ein warmer Schlag ist«, sprach Tony und nickte bei jedem Wort mit dem Kopfe, »so schlägt der Blitz ein. Wenn es aber ein kalter Schlag ist, so schlägt der Donner ein!«

Hierauf kreuzte sie die Arme und blickte in die lachenden Gesichter wie jemand, der seines Erfolges sicher ist. Herr Buddenbrook aber war böse auf diese Weisheit, er verlangte durchaus zu wissen, wer dem Kinde diese Stupidität beigebracht habe, und als sich ergab, Ida Jungmann, die kürzlich für die Kleinen engagierte Mamsell aus Marienwerder, sei es gewesen, mußte der Konsul diese Ida in Schutz nehmen.

»Sie sind zu streng, Papa. Warum sollte man in diesem Alter über dergleichen Dinge nicht seine eigenen wunderlichen Vorstellungen haben dürfen …«

»Excusez, mon cher! … Mais c'est une folie! Du weißt, daß solche Verdunkelung der Kinderköpfe mir verdrüßlich ist! Wat, de Dunner sleit in? Da sall doch gliek de Dunner inslahn! Geht mir mit eurer Preußin …«

Die Sache war die, daß der alte Herr auf Ida Jungmann nicht zum besten zu sprechen war. Er war kein beschränkter Kopf. Er hatte ein Stück von der Welt gesehen, war Anno 13 vierspännig nach Süddeutschland gefahren, um als Heereslieferant für Preußen Getreide aufzukaufen, war in Amsterdam und in Paris gewesen und hielt, ein aufgeklärter Mann, bei Gott nicht alles für verurteilenswürdig, was außerhalb der Tore seiner giebeligen Vaterstadt lag. Abgesehen vom geschäftlichen Verkehr aber, in gesellschaftlicher Beziehung, war er mehr als sein Sohn, der Konsul, geneigt, strenge Grenzen zu ziehen und Fremden ablehnend zu begegnen. Als daher eines Tages seine Kinder von einer Reise nach Westpreußen dies junge Mädchen – sie war erst jetzt zwanzig Jahre alt – als eine Art Jesuskind mit sich ins Haus gebracht hatten, eine Waise, die Tochter eines unmittelbar vor Ankunft der Buddenbrooks in Marienwerder verstorbenen Gasthofsbesitzers, da hatte der Konsul für diesen frommen Streich einen Auftritt mit seinem Vater zu bestehen gehabt, bei dem der alte Herr fast nur französisch und plattdeutsch sprach … Übrigens hatte Ida Jungmann sich als tüchtig im Hausstande und im Verkehr mit den Kindern erwiesen und eignete sich mit ihrer Loyalität und ihren preußischen Rangbegriffen im Grunde aufs beste für ihre Stellung in diesem Hause. Sie war eine Person von aristokratischen Grundsätzen, die haarscharf zwischen ersten und zweiten Kreisen, zwischen Mittelstand und geringerem Mittelstand unterschied, sie war stolz darauf, als ergebene Dienerin den ersten Kreisen anzugehören, und sah es ungern, wenn Tony sich etwa mit einer Schulkameradin befreundete, die nach Mamsell Jungmanns Schätzung nur dem guten Mittelstande zuzurechnen war …

In diesem Augenblick ward die Preußin selbst in der Säulenhalle sichtbar und trat durch die Glastür ein: ein ziemlich großes, knochig gebautes Mädchen in schwarzem Kleide, mit glattem Haar und einem ehrlichen Gesicht. Sie führte die kleine Klothilde an der Hand, ein außerordentlich mageres Kind in geblümtem Kattunkleidchen, mit glanzlosem, aschigem Haar und stiller Altjungfernmiene. Sie stammte aus einer völlig besitzlosen Nebenlinie, war die Tochter eines bei Rostock als Gutsinspektor ansässigen Neffen des alten Herrn Buddenbrook und ward, weil sie gleichaltrig mit Antonie und ein williges Geschöpf war, hier im Hause erzogen.

»Es ist alles bereit«, sagte Mamsell Jungmann und schnurrte das r in der Kehle, denn sie hatte es ursprünglich überhaupt nicht aussprechen können. »Klothildchen hat tücht'g geholfen in der Küche, Trina hat fast nichts zu tun brauchen …«

Monsieur Buddenbrook schmunzelte spöttisch in sein Jabot über Ida's fremdartige Aussprache; der Konsul aber streichelte seiner kleinen Nichte die Wange und sagte:

»So ist es recht, Thilda. Bete und arbeite, heißt es. Unsere Tony sollte sich ein Beispiel daran nehmen. Sie neigt nur allzuoft zu Müßiggang und Übermut …«

Tony ließ den Kopf hängen und blickte von unten herauf den Großvater an, denn sie wußte wohl, daß er sie, wie gewöhnlich, verteidigen werde.

»Nein, nein«, sagte er, »Kopf hoch, Tony, courage! Eines schickt sich nicht für alle. Jeder nach seiner Art. Thilda ist brav, aber wir sind auch nicht zu verachten. Spreche ich raisonable, Bethsy?«

Er wandte sich an seine Schwiegertochter, die seinem Geschmacke beizupflichten pflegte, während Madame Antoinette, mehr aus Klugheit wohl denn aus Überzeugung, meistens die Partei des Konsuls nahm. So reichten sich die beiden Generationen, im chassé croisé gleichsam, die Hände.

»Sie sind sehr gut, Papa«, sagte die Konsulin. »Tony wird sich bemühen, eine kluge und tüchtige Frau zu werden … Sind die Knaben aus der Schule gekommen?« fragte sie Ida.

Aber Tony, die vom Knie des Großvaters aus in den ›Spion‹ durchs Fenster sah, rief fast gleichzeitig:

»Tom und Christian kommen die Johannisstraße herauf … und Herr Hoffstede … und Onkel Doktor …«

Das Glockenspiel von Sankt Marien setzte mit einem Chorale ein: pang! ping, ping – pung! ziemlich taktlos, so daß man nicht recht zu erkennen vermochte, was es eigentlich sein sollte, aber doch voll Feierlichkeit, und während dann die kleine und die große Glocke fröhlich und würdevoll erzählten, daß es vier Uhr sei, schallte auch drunten die Glocke der Windfangtür gellend über die große Diele, worauf es in der Tat Tom und Christian waren, die ankamen, zusammen mit den ersten Gästen, mit Jean Jacques Hoffstede, dem Dichter, und Doktor Grabow, dem Hausarzt.





Zweites Kapitel


Herr Jean Jacques Hoffstede, der Poet der Stadt, der sicherlich auch für den heutigen Tag ein paar Reime in der Tasche hatte, war nicht viel jünger als Johann Buddenbrook, der Ältere, und, abgesehen von der grünen Farbe seines Leibrockes, in demselben Geschmack gekleidet. Aber er war dünner und beweglicher als sein alter Freund und besaß kleine, flinke, grünliche Augen und eine lange, spitze Nase.

»Besten Dank«, sagte er, nachdem er den Herren die Hände geschüttelt und vor den Damen – im besonderen vor der Konsulin, die er außerordentlich verehrte – ein paar seiner ausgesuchtesten compliments vollführt hatte, compliments, wie die neue Generation sie schlechterdings nicht mehr zustande brachte, und die von einem angenehm stillen und verbindlichen Lächeln begleitet waren. »Besten Dank für die freundliche Einladung, meine Hochverehrten. Diese beiden jungen Leute«, und er wies auf Tom und Christian, die in blauen Kitteln mit Ledergürteln bei ihm standen, »haben wir in der Königstraße getroffen, der Doktor und ich, als sie von ihren Studien kamen. Prächtige Bursche – Frau Konsulin? Thomas, das ist ein solider und ernster Kopf; er muß Kaufmann werden, darüber besteht kein Zweifel. Christian dagegen scheint mir ein wenig Tausendsassa zu sein, wie? ein wenig Incroyable … Allein ich verhehle nicht mein engouement. Er wird studieren, dünkt mich; er ist witzig und brillant veranlagt …«

Herr Buddenbrook bediente sich seiner goldenen Tabaksdose.

»'n Aap is hei! Soll er nicht gleich Dichter werden, Hoffstede?«

Mamsell Jungmann steckte die Fenstervorhänge übereinander, und bald lag das Zimmer in dem etwas unruhigen, aber diskreten und angenehmen Licht der Kerzen des Kristallkronleuchters und der Armleuchter, die auf dem Sekretäre standen.

»Nun, Christian«, sagte die Konsulin, deren Haar goldig aufleuchtete, »was hast du heute nachmittag gelernt?« Und es ergab sich, daß Christian Schreiben, Rechnen und Singen gehabt hatte.

Er war ein Bürschchen von sieben Jahren, das schon jetzt in beinahe lächerlicher Weise seinem Vater ähnlich war. Es waren die gleichen, ziemlich kleinen, runden und tiefliegenden Augen, die gleiche stark hervorspringende und gebogene Nase war schon erkenntlich, und unterhalb der Wangenknochen deuteten bereits ein paar Linien darauf hin, daß die Gesichtsform nicht immer die jetzige kindliche Fülle behalten werde.

»Wir haben furchtbar gelacht«, fing er an zu plappern, während seine Augen im Zimmer von einem zum anderen gingen. »Paßt mal auf, was Herr Stengel zu Siegmund Köstermann gesagt hat.« Er beugte sich vor, schüttelte den Kopf und redete eindringlich in die Luft hinein: »Äußerlich, mein gutes Kind, äußerlich bist du glatt und geleckt, ja, aber innerlich, mein gutes Kind, da bist du schwarz …« Und dies sagte er unter Weglassung des r und indem er »schwarz« wie »swärz« aussprach – mit einem Gesicht, in dem sich der Unwille über diese »äußeliche« Glätte und Gelecktheit mit einer so überzeugenden Komik malte, daß alles in Gelächter ausbrach.

»'n Aap is hei!« wiederholte der alte Buddenbrook kichernd. Herr Hoffstede aber war außer sich vor Entzücken.

»Charmant!« rief er. »Unübertrefflich! Man muß Marcellus Stengel kennen! Akkurat so! Nein, das ist gar zu köstlich!«

Thomas, dem solche Begabung abging, stand neben seinem jüngeren Bruder und lachte neidlos und herzlich. Seine Zähne waren nicht besonders schön, sondern klein und gelblich. Aber seine Nase war auffallend fein geschnitten, und er ähnelte in den Augen und in der Gesichtsform stark seinem Großvater.

Man hatte zum Teil auf den Stühlen und dem Sofa Platz genommen, man plauderte mit den Kindern, sprach über die frühe Kälte, das Haus … Herr Hoffstede bewunderte am Sekretär ein prachtvolles Tintenfaß aus Sèvres-Porzellan in Gestalt eines schwarzgefleckten Jagdhundes. Doktor Grabow aber, ein Mann vom Alter des Konsuls, zwischen dessen spärlichem Backenbart ein langes, gutes und mildes Gesicht lächelte, betrachtete die Kuchen, Korinthenbrote und verschiedenartigen gefüllten Salzfäßchen, die auf dem Tische zur Schau gestellt waren. Es war das ›Salz und Brot‹, das der Familie von Verwandten und Freunden zum Wohnungswechsel übersandt worden war. Da man aber sehen sollte, daß die Gabe nicht aus geringen Häusern komme, bestand das Brot in süßem, gewürztem und schwerem Gebäck und war das Salz von massivem Golde umschlossen.

»Ich werde wohl zu tun bekommen«, sagte der Doktor, indem er auf die Süßigkeiten wies und den Kindern drohte. Dann hob er mit wiegendem Kopf ein gediegenes Gerät für Salz, Pfeffer und Senf empor.

»Von Lebrecht Kröger«, sagte Monsieur Buddenbrook schmunzelnd. »Immer kulant, mein lieber Herr Verwandter. Ich habe ihm dergleichen nicht spendiert, als er sich sein Gartenhaus vorm Burgtor gebaut hatte. Aber so war er immer … nobel! spendabel! ein à la mode-Kavalier …«

Mehrmals hatte die Glocke durchs ganze Haus gegellt. Pastor Wunderlich langte an, ein untersetzter alter Herr in langem, schwarzem Rock, mit gepudertem Haar und einem weißen, behaglich lustigen Gesicht, in dem ein Paar grauer, munterer Augen blinzelten. Er war seit vielen Jahren Witwer und rechnete sich zu den Junggesellen aus der alten Zeit, wie der lange Makler, Herr Grätjens, der mit ihm kam und beständig eine seiner hageren Hände nach Art eines Fernrohrs zusammengerollt vors Auge hielt, als prüfe er ein Gemälde; er war ein allgemein anerkannter Kunstkenner.

Auch Senator Doktor Langhals nebst Frau kamen an, langjährige Freunde des Hauses, – nicht zu vergessen den Weinhändler Köppen mit dem großen, dunkelroten Gesicht, das zwischen den hochgepolsterten Ärmeln saß, und seine gleichfalls so sehr beleibte Gattin …

Es war schon nach halb fünf Uhr, als schließlich die Krögers eintrafen, die Alten sowohl wie ihre Kinder, Konsul Krögers mit ihren Söhnen Jakob und Jürgen, die im Alter von Tom und Christian standen. Und fast gleichzeitig mit ihnen kamen auch die Eltern der Konsulin Kröger, Holzgroßhändler Oeverdieck nebst Frau, ein altes, zärtliches Ehepaar, das sich vor aller Ohren mit den bräutlichsten Kosenamen zu benennen pflegte.

»Feine Leute kommen spät«, sagte Konsul Buddenbrook und küßte seiner Schwiegermutter die Hand.

»Öwer denn ook gliek düchtig!«, und Johann Buddenbrook machte eine weite Armbewegung über die Kröger'sche Verwandtschaft hin, indem er dem Alten die Hand schüttelte …

Lebrecht Kröger, der à la mode-Kavalier, eine große, distinguierte Erscheinung, trug noch leicht gepudertes Haar, war aber modisch gekleidet. An seiner Sammetweste blitzten zwei Reihen von Edelsteinknöpfen. Justus, sein Sohn, mit kleinem Backenbart und spitz emporgedrehtem Schnurrbart, ähnelte, was Figur und Benehmen anbetraf, stark seinem Vater; auch über die nämlichen runden und eleganten Handbewegungen verfügte er.

Man setzte sich gar nicht erst, sondern stand, in Erwartung der Hauptsache, in einem vorläufigen und nachlässigen Gespräch beieinander. Und Johann Buddenbrook, der Ältere, bot auch schon Madame Köppen seinen Arm, indem er mit vernehmlicher Stimme sagte:

»Na, wenn wir alle Appetit haben, mesdames et messieurs …«

Mamsell Jungmann und das Folgmädchen hatten die weiße Flügeltür zum Speisesaal geöffnet, und langsam, in zuversichtlicher Gemächlichkeit, bewegte sich die Gesellschaft hinüber; man konnte eines nahrhaften Bissens gewärtig sein bei Buddenbrooks …





Drittes Kapitel


Der jüngere Hausherr hatte, als der allgemeine Aufbruch begann, mit der Hand nach der linken Brustseite gegriffen, wo ein Papier knisterte, das gesellschaftliche Lächeln war plötzlich von seinem Gesicht verschwunden, um einem gespannten und besorgten Ausdruck Platz zu machen, und an seinen Schläfen spielten, als ob er die Zähne aufeinanderbisse, ein paar Muskeln. Nur zum Schein machte er einige Schritte dem Speisesaale zu, dann aber hielt er sich zurück und suchte mit den Augen seine Mutter, die als eine der letzten, an der Seite Pastor Wunderlichs, die Schwelle überschreiten wollte.

»Pardon, lieber Herr Pastor … Auf zwei Worte, Mama!« Und während der Pastor ihm munter zunickte, nötigte Konsul Buddenbrook die alte Dame ins Landschaftszimmer zurück und zum Fenster.

»Es ist, um kurz zu sein, ein Brief von Gotthold gekommen«, sagte er rasch und leise, indem er in ihre fragenden, dunklen Augen sah und das gefaltete und versiegelte Papier aus der Tasche zog. »Das ist seine Handschrift … Es ist das dritte Schreiben, und nur das erste hat Papa ihm beantwortet … Was machen? Es ist schon um zwei Uhr angekommen, und ich hätte es dem Vater längst einhändigen müssen, aber sollte ich ihm heute die Stimmung verderben? Was sagen Sie? Es ist immer noch Zeit, ihn herauszubitten …«

»Nein, du hast recht, Jean, warte damit!« sagte Madame Buddenbrook und erfaßte nach ihrer Gewohnheit mit einer schnellen Bewegung den Arm ihres Sohnes. »Was soll darin stehen!« fügte sie bekümmert hinzu. »Er gibt nicht nach, der Junge. Er kapriziert sich auf diese Entschädigungssumme für den Anteil am Hause … Nein, nein, Jean, noch nicht jetzt … Heute abend vielleicht, vorm Zubettegehn …«

»Was tun?« wiederholte der Konsul, indem er den gesenkten Kopf schüttelte. »Ich selbst habe Papa oft genug bitten wollen, nachzugeben … Es soll nicht aussehen, als ob ich, der Stiefbruder, mich bei den Eltern eingenistet hätte und gegen Gotthold intrigierte … auch dem Vater gegenüber muß ich den Anschein dieser Rolle vermeiden. Aber wenn ich ehrlich sein soll … ich bin schließlich Associé. Und dann bezahlen Bethsy und ich vorläufig eine ganz normale Miete für den zweiten Stock … Was meine Schwester in Frankfurt betrifft, nun, so ist die Sache arrangiert. Ihr Mann bekommt schon jetzt, bei Papas Lebzeiten, eine Abstandssumme, ein Viertel bloß von der Haus-Kaufsumme … Das ist ein vorteilhaftes Geschäft, das Papa sehr glatt und gut erledigt hat und das im Sinne der Firma höchst erfreulich ist. Und wenn Papa sich Gotthold gegenüber so ganz abweisend verhält, so ist das …«

»Nein, Unsinn, Jean, dein Verhältnis zur Sache ist doch wohl klar. Aber Gotthold glaubt, daß ich, seine Stiefmutter, nur für meine eigenen Kinder sorge und ihm seinen Vater geflissentlich entfremde. Das ist das Traurige …«

»Aber es ist seine Schuld!« rief der Konsul beinahe laut und mäßigte dann seine Stimme mit einem Blick nach dem Speisesaal. »Es ist seine Schuld, dies traurige Verhältnis! Urteilen Sie selbst! Warum konnte er nicht vernünftig sein! Warum mußte er diese Demoiselle Stüwing heiraten und den … Laden …« Der Konsul lachte ärgerlich und verlegen bei diesem Worte. »Es ist eine Schwäche, Vaters Widerwille gegen den Laden; aber Gotthold hätte diese kleine Eitelkeit respektieren müssen …«

»Ach, Jean, das beste wäre, Papa gäbe nach!«

»Aber kann ich denn dazu raten?« flüsterte der Konsul mit einer erregten Handbewegung nach der Stirn. »Ich bin persönlich interessiert, und deshalb müßte ich sagen: Vater, bezahle. Aber ich bin auch Associé, ich habe die Interessen der Firma zu vertreten, und wenn Papa nicht glaubt, einem ungehorsamen und rebellischen Sohn gegenüber die Verpflichtung zu haben, dem Betriebskapital die Summe zu entziehen … Es handelt sich um mehr als elftausend Kuranttaler. Das ist gutes Geld … Nein, nein, ich kann nicht zuraten … aber auch nicht abraten. Ich will nichts davon wissen. Nur die Szene mit Papa ist mir désagréable …«

»Abends spät, Jean. Komm nun, man wartet …«

Der Konsul barg das Papier in der Brusttasche, bot seiner Mutter den Arm, und nebeneinander überschritten sie die Schwelle zum hellerleuchteten Speisesaal, wo die Gesellschaft mit der Placierung um die lange Tafel soeben fertig geworden war.

Aus dem himmelblauen Hintergrund der Tapeten traten zwischen schlanken Säulen weiße Götterbilder fast plastisch hervor. Die schweren roten Fenstervorhänge waren geschlossen, und in jedem Winkel des Zimmers brannten auf einem hohen, vergoldeten Kandelaber acht Kerzen, abgesehen von denen, die in silbernen Armleuchtern auf der Tafel standen. Über dem massigen Büffet, dem Landschaftszimmer gegenüber, hing ein umfangreiches Gemälde, ein italienischer Golf, dessen blaudunstiger Ton in dieser Beleuchtung außerordentlich wirksam war. Mächtige, steiflehnige Sofas in rotem Damast standen an den Wänden.

Es war jede Spur von Besorgnis und Unruhe aus dem Gesicht Madame Buddenbrooks verschwunden, als sie sich zwischen dem alten Kröger, der an der Fensterseite präsidierte, und Pastor Wunderlich niederließ.

»Bon appétit!« sagte sie mit ihrem kurzen, raschen, herzlichen Kopfnicken, indem sie einen schnellen Blick über die ganze Tafel bis zu den Kindern hinunter gleiten ließ …





Viertes Kapitel


»Wie gesagt, alle Achtung, Buddenbrook!« übertönte die wuchtige Stimme des Herrn Köppen das allgemeine Gespräch, als das Folgmädchen mit den nackten, roten Armen, dem dicken, gestreiften Rock und der kleinen weißen Mütze auf dem Hinterkopf, unter Beihilfe Mamsell Jungmanns und des Mädchens der Konsulin von oben, die heiße Kräutersuppe nebst geröstetem Brot serviert hatte und man anfing, behutsam zu löffeln.

»Alle Achtung! Diese Weitläufigkeit, diese Noblesse … ich muß sagen, hier läßt sich leben, muß ich sagen …« Herr Köppen hatte bei den früheren Besitzern des Hauses nicht verkehrt; er war noch nicht lange reich, stammte nicht gerade aus einer Patrizierfamilie und konnte sich einiger Dialektschwächen, wie die Wiederholung von »muß ich sagen«, leider noch nicht entwöhnen. Außerdem sagte er »Achung« statt »Achtung«.

»Hat auch gar kein Geld gekostet«, bemerkte trocken Herr Grätjens, der es wissen mußte, und betrachtete durch die hohle Hand eingehend den Golf.

Man hatte soweit wie möglich bunte Reihe gemacht und die Kette der Verwandten durch Hausfreunde unterbrochen. Streng aber war dies nicht durchzuführen gewesen, und die alten Oeverdiecks saßen einander wie gewöhnlich fast auf dem Schoße, sich innig zunickend. Der alte Kröger aber thronte hoch und gerade zwischen der Senatorin Langhals und Madame Antoinette und verteilte seine Handbewegungen und seine reservierten Scherze an die beiden Damen.

»Wann ist das Haus noch gebaut worden?« fragte Herr Hoffstede schräg über den Tisch hinüber den alten Buddenbrook, der sich in jovialem und etwas spöttischem Tone mit Madame Köppen unterhielt.

»Anno … warte mal … Um 1680, wenn ich nicht irre. Mein Sohn weiß übrigens besser mit solchen Daten Bescheid …«

»Zweiundachtzig«, bestätigte, sich vorbeugend, der Konsul, der weiter unten, ohne eine Tischdame, neben Senator Langhals seinen Platz hatte. »1682, im Winter, ist es fertig geworden. Mit ›Ratenkamp & Comp.‹ fing es damals an, aufs glänzendste bergauf zu gehen … Traurig, dieses Sinken der Firma in den letzten zwanzig Jahren …«

Ein allgemeiner Stillstand des Gespräches trat ein und dauerte eine halbe Minute. Man blickte in seinen Teller und gedachte dieser ehemals so glänzenden Familie, die das Haus erbaut und bewohnt hatte und die verarmt, heruntergekommen davongezogen war …

»Tja, traurig«, sagte der Makler Grätjens; »wenn man bedenkt, welcher Wahnsinn den Ruin herbeiführte … Wenn Dietrich Ratenkamp damals nicht diesen Geelmaack zum Kompagnon genommen hätte! Ich habe, weiß Gott, die Hände über dem Kopf zusammengeschlagen, als der anfing zu wirtschaften. Ich weiß es aus bester Quelle, meine Herrschaften, wie greulich der hinter Ratenkamps Rücken spekuliert und Wechsel hier und Akzepte dort auf den Namen der Firma gegeben hat … Schließlich war es aus … Da waren die Banken mißtrauisch, da fehlte die Deckung … Sie haben keine Vorstellung … Wer hat auch nur das Lager kontrolliert? Geelmaack vielleicht? Sie haben da wie die Ratten gehaust, jahraus, jahrein! Aber Ratenkamp kümmerte sich um nichts …«

»Er war wie gelähmt«, sagte der Konsul. Sein Gesicht hatte einen düsteren und verschlossenen Ausdruck angenommen. Er bewegte, vornübergebeugt, den Löffel in seiner Suppe und ließ dann und wann einen kurzen Blick seiner kleinen, runden, tiefliegenden Augen zum oberen Tischende hinaufschweifen. »Er ging wie unter einem Drucke einher, und ich glaube, man kann diesen Druck begreifen. Was veranlaßte ihn, sich mit Geelmaack zu verbinden, der bitter wenig Kapital hinzubrachte, und dem niemand den besten Leumund machte? Er muß das Bedürfnis empfunden haben, einen Teil der furchtbaren Verantwortlichkeit auf irgend jemanden abzuwälzen, weil erfühlte, daß es unaufhaltsam zu Ende ging … Diese Firma hatte abgewirtschaftet, diese alte Familie war passée. Wilhelm Geelmaack hat sicherlich nur den letzten Anstoß zum Ruin gegeben …«

»Sie sind also der Ansicht, werter Herr Konsul«, sagte Pastor Wunderlich mit bedächtigem Lächeln und schenkte seiner Dame und sich selbst Rotwein ins Glas, »daß auch ohne den Hinzutritt des Geelmaack und seines wilden Gebarens alles gekommen wäre, wie es gekommen ist?«

»Das wohl nicht«, sagte der Konsul gedankenvoll und ohne sich an eine bestimmte Person zu wenden. »Aber ich glaube, daß Dietrich Ratenkamp sich notwendig und unvermeidlich mit Geelmaack verbinden mußte, damit das Schicksal erfüllt würde … Er muß unter dem Druck einer unerbittlichen Notwendigkeit gehandelt haben … Ach, ich bin überzeugt, daß er das Treiben seines Associés halb und halb gekannt hat, daß er auch über die Zustände in seinem Lager nicht so vollständig unwissend war. Aber er war erstarrt …«

»Na, assez, Jean«, sagte der alte Buddenbrook und legte seinen Löffel aus der Hand. »Das ist so eine von deinen idées …«

Der Konsul hob mit einem zerstreuten Lächeln sein Glas seinem Vater entgegen. Lebrecht Kröger aber sprach:

»Nein, halten wir es nun mit der fröhlichen Gegenwart!«

Er faßte dabei vorsichtig und elegant den Hals seiner Weißwein-Bouteille, auf deren Pfropfen ein kleiner silberner Hirsch stand, legte sie ein wenig auf die Seite und prüfte aufmerksam die Etikette. »C. F. Köppen«, las er und nickte dem Weinhändler zu; »ach ja, was wären wir ohne Sie!«

Die Meißener Teller mit Goldrand wurden gewechselt, wobei Madame Antoinette die Bewegungen der Mädchen scharf beobachtete, und Mamsell Jungmann rief Anordnungen in den Schalltrichter des Sprachrohres hinein, das den Eßsaal mit der Küche verband. Es wurde der Fisch herumgereicht, und während Pastor Wunderlich sich mit Vorsicht bediente, sagte er:

»Diese fröhliche Gegenwart ist immerhin nicht so ganz selbstverständlich. Die jungen Leute, die sich hier jetzt mit uns Alten freuen, denken wohl nicht daran, daß es jemals anders gewesen sein könnte … Ich darf sagen, daß ich an den Schicksalen unserer Buddenbrooks nicht selten persönlichen Anteil genommen habe … Immer, wenn ich diese Dinge vor Augen habe« – und er wandte sich an Madame Antoinette, indem er einen der schweren silbernen Löffel vom Tische nahm –, »muß ich denken, ob sie nicht zu den Stücken gehören, die Anno sechs unser Freund, der Philosoph Lenoir, Sergeant Seiner Majestät des Kaisers Napoléon, in Händen hatte … und erinnere mich unserer Begegnung in der Alfstraße, Madame …«

Madame Buddenbrook blickte mit einem halb verlegenen, halb erinnerungsschweren Lächeln vor sich nieder. Tom und Tony, dort unten, die keinen Fisch essen mochten und dem Gespräch der großen Leute aufmerksam gefolgt waren, riefen beinahe einstimmig herauf: »Ach ja, erzählen Sie, Großmama!« Aber der Pastor, der wußte, daß sie es nicht liebte, von diesem für sie ein wenig peinlichen Vorfall selbst zu berichten, begann statt ihrer noch einmal mit der alten kleinen Geschichte, auf welche die Kinder gern zum hundertsten Male gehorcht hätten, und die vielleicht einem oder dem anderen noch unbekannt war …

»Kurz und gut, man figuriere sich: Es ist ein Novembernachmittag, kalt und regnicht, daß Gott erbarm', ich komme von einem Amtsgeschäft die Alfstraße hinauf und denke der schlimmen Zeiten. Fürst Blücher war fort, die Franzosen waren in der Stadt, aber von der herrschenden Erregung merkte man wenig. Die Straßen lagen still, die Leute saßen in ihren Häusern und hüteten sich. Schlachtermeister Prahl, der mit den Händen in den Hosentaschen vor seiner Tür gestanden und mit seiner dröhnendsten Stimme gesagt hatte: ›Dat is je denn doch woll zu arg, is dat je denn doch woll –!‹ war einfach, bauz, vor den Kopf geknallt worden … Nun, ich denke: Du willst einmal zu Buddenbrooks hineinsehen, ein Zuspruch könnte willkommen sein; der Mann liegt mit der Kopfrose, und Madame wird mit der Einquartierung zu schaffen haben.

Da, im nämlichen Moment, wen sehe ich mir entgegenkommen? Unsere allverehrte Madame Buddenbrook. Allein in welcher Verfassung? Sie eilt ohne Hut durch den Regen, sie hat kaum einen Schal um die Schultern geworfen, sie stürzt mehr, als sie geht, und ihre coiffure ist eine komplette Wirrnis … Nein, das ist wahr, Madame! es war kaum noch die Rede von einer coiffure.

›Welch angenehme surprise!‹ sage ich und erlaube mir, sie, die mich gar nicht sieht, am Ärmel zu halten, denn mir schwant nichts Gutes … ›Wohin doch so schnell, meine Liebe?‹ Sie bemerkt mich, sie blickt mich an, sie stößt hervor: ›Sind Sie's … leben Sie wohl! Alles ist zu Ende! Ich gehe hinunter in die Trave!‹

›Behüte!‹ sage ich und fühle, wie ich weiß werde. ›Das ist der Ort nicht für Sie, meine Liebe! Was ist aber passiert?‹ Und ich halte sie so fest, als der Respekt es zuläßt. ›Was passiert ist?‹ ruft sie und zittert. ›Sie sind über dem Silberzeug, Wunderlich! Das ist passiert! Und Jean liegt mit der Kopfrose und kann mir nicht helfen! Und er könnte auch nicht helfen, wäre er auf den Beinen! Sie stehlen meine Löffel, meine silbernen Löffel, das ist passiert, Wunderlich, und ich gehe in die Trave!‹

Nun, ich halte unsere Freundin, ich sage, was man sagt in solchen Fällen, ›Courage‹, sage ich, ›Liebste!‹ und ›Alles wird gut werden!‹ und ›Wir wollen reden mit den Leuten, fassen Sie sich, ich beschwöre Sie, und gehen wir!‹ Und ich führe sie die Straße hinauf in ihr Haus. Im Eßzimmer droben finden wir die Miliz, wie Madame sie verlassen, an die zwanzig Mann hoch, die sich mit der großen Truhe abgeben, wo das Silberzeug liegt.

›Mit wem von Ihnen kann ich Rücksprache nehmen‹, frage ich höflich, ›meine Herren?‹ Nun, man fängt an zu lachen und ruft: ›Mit uns allen, Papa!‹ Dann aber tritt einer vor und präsentiert sich, ein Mensch, der lang ist wie ein Baum, mit einem schwarz gewichsten Schnauzbart und großen roten Händen, die aus den betreßten Aufschlägen heraussehen. ›Lenoir‹, sagt er und salutiert mit der Linken, denn in der Rechten hält er ein Bündel von fünf oder sechs silbernen Löffeln, ›Lenoir, Sergeant. Was wünscht der Herr?‹

›Herr Offizier!‹ sage ich und ziele auf den point d'honneur. ›SoIlte die Beschäftigung mit diesen Dingen sich mit Ihrer glänzenden Charge vereinbaren? … Die Stadt hat sich dem Kaiser nicht verschlossen …‹ – ›Was wollen Sie?‹ antwortet er. ›Das ist der Krieg! Die Leute benötigen dergleichen Geschirr …‹

›Sie sollten Rücksicht nehmen‹, unterbrach ich ihn, denn mir kommt ein Gedanke. ›Diese Dame‹, sage ich, denn was sagt man nicht in solcher Lage, ›die Herrin des Hauses, sie ist nicht etwa eine Deutsche, sie ist beinahe Ihre Landsmännin, sie ist eine Französin …‹ – ›Wie, eine Französin?‹ wiederholt er. Und was glauben Sie, daß dieser lange Haudegen hinzufügt? – ›Eine Emigrantin also?‹ sagt er. ›Aber dann ist sie eine Feindin der Philosophie!‹

Ich bin baff, aber ich verschlucke mein Lachen. ›Sie sind‹, sage ich, ›ein Mann von Kopf, wie ich sehe. Ich wiederhole, daß es mir Ihrer nicht würdig scheint, sich mit diesen Dingen zu befassen!‹ – Er schweigt einen Augenblick; dann aber, plötzlich, wird er rot, er wirft seine sechs Löffel in die Truhe und ruft: ›Aber wer sagt Ihnen denn, daß ich etwas anderes mit diesen Dingen beabsichtigte, als sie ein wenig zu betrachten?! Hübsche Sachen, das! Wenn einer oder der andere der Leute ein Stück als Souvenir mit sich nehmen sollte …‹

Nun, sie haben immerhin noch genug Souvenirs mit sich genommen, da half keine Berufung auf menschliche oder göttliche Gerechtigkeit … Sie kannten wohl keinen anderen Gott als diesen fürchterlichen kleinen Menschen …«





Fünftes Kapitel


»Sie haben ihn gesehen, Herr Pastor?« –

Die Teller wurden aufs neue gewechselt. Ein kolossaler, ziegelroter, panierter Schinken erschien, geräuchert, gekocht, nebst brauner, säuerlicher Schalottensauce und solchen Mengen von Gemüsen, daß alle aus einer einzigen Schüssel sich hätten sättigen können. Lebrecht Kröger übernahm das Tranchieren. Die Ellenbogen in legerer Weise erhoben, die langen Zeigefinger gerade auf den Rücken von Messer und Gabel ausgestreckt, schnitt er mit Bedacht die saftigen Stücke hinunter. Auch das Meisterwerk der Konsulin Buddenbrook, der ›Russische Topf‹, ein prickelnd und spirituös schmeckendes Gemisch konservierter Früchte, wurde gereicht. –

Nein, Pastor Wunderlich bedauerte, Bonaparte niemals zu Gesichte bekommen zu haben. Der alte Buddenbrook aber sowohl wie Jean Jacques Hoffstede hatten ihn von Angesicht zu Angesicht gesehen; ersterer zu Paris, unmittelbar vor der russischen Kampagne, gelegentlich einer Parade im Schloßhofe der Tuilerien, letzterer zu Danzig …

»Gott, nein, er sah nicht gemütlich aus«, sagte er, indem er einen Bissen von Schinken, Rosenkohl und Kartoffel, den er auf seiner Gabel komponiert, mit erhobenen Brauen in den Mund schob. »Übrigens soll er sich ganz heiter benommen haben, in Danzig. Man erzählte sich damals einen Scherz … Er hasardierte den ganzen Tag mit den Deutschen, und zwar nicht eben harmlos, abends aber spielte er mit seinen Generälen. ›N'est-ce pas, Rapp‹, sagte er und griff eine Handvoll Gold vom Tische, ›les Allemands aiment beaucoup ces petits Napoléons?‹ – ›Oui, Sire, plus que le Grand!‹ antwortete Rapp …«

In der allgemeinen Heiterkeit, die laut wurde – denn Hoffstede hatte die Anekdote hübsch erzählt und sogar ein wenig das Mienenspiel des Kaisers markiert –, sagte der alte Buddenbrook:

»Na, ungescherzt, allen Respekt übrigens vor seiner persönlichen Großheit … Was für eine Natur!«

Der Konsul schüttelte ernsthaft den Kopf.

»Nein, nein, wir Jüngeren verstehen nicht mehr die Verehrungswürdigkeit des Mannes, der den Herzog von Enghien ermordete, der in Ägypten die achthundert Gefangenen niedermetzelte …«

»Das alles ist möglicherweise übertrieben und gefälscht«, sagte Pastor Wunderlich. »Der Herzog mag ein leichtsinniger und aufrührerischer Herr gewesen sein, und was die Gefangenen betrifft, so war ihre Exekution wahrscheinlich der wohlerwogene und notwendige Beschluß eines korrekten Kriegsrates …« Und er erzählte von einem Buche, das vor einigen Jahren erschienen war und das er gelesen hatte, das Werk eines Sekretärs des Kaisers, das volle Aufmerksamkeit verdiene …

»Gleichviel«, beharrte der Konsul, indem er eine Kerze putzte, die im Armleuchter vor ihm flackerte. »Ich begreife es nicht, ich begreife nicht die Bewunderung für diesen Unmenschen! Als christlicher Mann, als Mensch von religiösem Empfinden finde ich in meinem Herzen keinen Raum für ein solches Gefühl.«

Sein Gesicht hatte einen stillen und schwärmerischen Ausdruck angenommen, ja, er hatte sogar den Kopf ein wenig auf die Seite gelegt – während es wahrhaftig aussah, als ob sein Vater und Pastor Wunderlich einander ganz leise zulächelten.

»Ja, ja«, schmunzelte Johann Buddenbrook, »aber die kleinen Napoléons waren nicht übel, was? Mein Sohn schwärmt mehr für Louis Philipp«, fügte er hinzu.

»Schwärmt?« wiederholte Jean Jacques Hoffstede ein bißchen mokant … »Eine kuriose Zusammenstellung! Philipp Egalité und schwärmen …«

»Nun, mich dünkt, daß wir von der Juli-Monarchie bei Gott eine Menge zu lernen haben …« Der Konsul sprach ernst und eifrig. »Das freundliche und hilfreiche Verhältnis des französischen Konstitutionalismus zu den neuen praktischen Idealen und Interessen der Zeit … ist etwas so überaus Dankenswertes …«

»Praktische Ideale … na, ja …« Der alte Buddenbrook spielte während einer Pause, die er seinen Kinnladen gönnte, mit seiner goldenen Dose. »Praktische Ideale … nee, ich bin da gar nich für!« Er verfiel vor Verdruß in den Dialekt. »Da schießen nun die gewerblichen Anstalten und die technischen Anstalten und die Handelsschulen aus der Erde, und das Gymnasium und die klassische Bildung sind plötzlich Bêtisen, und alle Welt denkt an nichts als Bergwerke … und Industrie … und Geldverdienen … Brav, das alles, höchst brav! Aber ein bißchen stupide, von der anderen Seite, so auf die Dauer – wie? Ich weiß nicht, warum es mir ein Affront ist … ich habe nichts gesagt, Jean … die Juli-Monarchie ist eine gute Sache …«

Senator Langhals aber sowohl wie Grätjens und Köppen standen dem Konsul zur Seite … Ja, wahrhaftig, vor der französischen Regierung und den gleichartigen Bestrebungen in Deutschland müsse man die größte Achtung haben … Herr Köppen sagte wieder »Achung«. – Er war noch viel röter geworden während des Speisens und schnob vernehmlich; Pastor Wunderlichs Gesicht aber blieb weiß, fein und aufgeweckt, obgleich er in aller Behaglichkeit ein Glas nach dem andern trank.

Die Kerzen brannten langsam, langsam hinunter und ließen dann und wann, wenn ihre Flammen im Luftzuge zur Seite flackerten, einen feinen Wachsgeruch über die Tafel hinwehen.

Man saß auf hochlehnigen, schweren Stühlen, speiste mit schwerem Silbergerät schwere, gute Sachen, trank schwere, gute Weine dazu und sagte seine Meinung. Man war bald bei den Geschäften und verfiel unwillkürlich mehr und mehr dabei in den Dialekt, in diese behaglich schwerfällige Ausdrucksweise, die kaufmännische Kürze sowohl wie wohlhabende Nachlässigkeit an sich zu haben schien und die hie und da mit gutmütiger Selbstironie übertrieben wurde. Man sagte nicht: »an der Börse«, man sagte ganz einfach: »an Börse« … wobei man zum Überfluß das r wie ein kurzes ä aussprach und ein wohlgefälliges Gesicht dazu machte.

Die Damen waren dem Disput nicht lange gefolgt. Madame Kröger führte bei ihnen das Wort, indem sie in der appetitlichsten Art die beste Manier auseinandersetzte, Karpfen in Rotwein zu kochen … »Wenn sie in ordentliche Stücken zerschnitten sind, Liebe, dann mit Zwiebeln und Nelken und Zwieback in die Kasserolle, und dann kriegen Sie sie mit etwas Zucker und einem Löffel Butter zu Feuer … Aber nicht waschen, Liebste, alles Blut mitnehmen, um Gottes willen …«

Der alte Kröger ließ die angenehmsten Scherze einfließen. Konsul Justus, sein Sohn, aber, der neben Doktor Grabow weiter unten in der Nähe der Kinder saß, hatte mit Mamsell Jungmann ein neckisches Gespräch angeknüpft; sie kniff ihre braunen Augen zusammen und hielt nach ihrer Gewohnheit Messer und Gabel gerade empor, indem sie sie leicht hin und her bewegte. Selbst Oeverdiecks waren ganz laut und lebendig geworden. Die alte Konsulin hatte ein neues Kosewort für ihren Gatten erfunden: »Du gutes Schnuckeltier!« sagte sie und schüttelte ihre Haube vor Herzlichkeit.

Das Gespräch floß in einen Gegenstand zusammen, als Jean Jacques Hoffstede auf sein Lieblingsthema zu sprechen kam, auf die italienische Reise, die er vor fünfzehn Jahren mit einem reichen Hamburger Verwandten gemacht hatte. Er erzählte von Venedig, Rom und dem Vesuv, er sprach von der Villa Borghese, wo der verstorbene Goethe einen Teil seines ›Faust‹ geschrieben habe, er schwärmte von Renaissance-Brunnen, die Kühlung spendeten, von wohlbeschnittenen Alleen, in denen es sich so angenehm lustwandeln lasse, und jemand erwähnte des großen, verwilderten Gartens, den Buddenbrooks gleich hinter dem Burgtore besaßen …

»Ja, meiner Treu!« sagte der Alte. »Ich ärgere mich noch immer, daß ich mich seinerzeit nicht resolvieren konnte, ihn ein bißchen menschlich herrichten zu lassen! Ich bin kürzlich mal wieder hindurchgegangen – es ist eine Schande, dieser Urwald! Welch nett Besitztum, wenn das Gras gepflegt, die Bäume hübsch kegel- und würfelförmig beschnitten wären …«

Der Konsul aber protestierte mit Eifer.

»Um Gottes willen, Papa –! Ich ergehe mich sommers dort gern im Gestrüpp; aber alles wäre mir verdorben, wenn die schöne, freie Natur so kläglich zusammengeschnitten wäre …«

»Aber wenn die freie Natur doch mir gehört, habe ich da zum Kuckuck nicht das Recht, sie nach meinem Belieben herzurichten …«

»Ach Vater, wenn ich dort im hohen Grase unter dem wuchernden Gebüsch liege, ist es mir eher, als gehörte ich der Natur und als hätte ich nicht das mindeste Recht über sie …«

»Krischan, freet mi nich tau veel«, rief plötzlich der alte Buddenbrook, »Thilda, der schadt es nichts … packt ein wie söben Drescher, die Dirn …«

Und wahrhaftig, es war zum Erstaunen, welche Fähigkeiten dieses stille, magere Kind mit dem langen, ältlichen Gesicht beim Essen entwickelte. Sie hatte auf die Frage, ob sie zum zweiten Male Suppe wünsche, gedehnt und demütig geantwortet: »J-a-bit-te!« Sie hatte sich vom Fisch wie vom Schinken zweimal je zwei der größten Stücke nebst starken Haufen von Zutaten gewählt, sorgsam und kurzsichtig über den Teller gebeugt, und sie verzehrte alles, ohne Überhastung, still und in großen Bissen. Auf die Worte des alten Hausherrn antwortete sie nur langgezogen, freundlich, verwundert und einfältig: »Gott – On-k-el?« Sie ließ sich nicht einschüchtern, sie aß, ob es auch nicht anschlug und ob man sie verspottete, mit dem instinktmäßig ausbeutenden Appetit der armen Verwandten am reichen Freitische, lächelte unempfindlich und bedeckte ihren Teller mit guten Dingen, geduldig, zäh, hungrig und mager.





Sechstes Kapitel


Nun kam, in zwei großen Kristallschüsseln, der ›Plettenpudding‹, ein schichtweises Gemisch aus Makronen, Himbeeren, Biskuits und Eiercreme; am unteren Tischende aber begann es aufzuflammen, denn die Kinder hatten ihren Lieblings-Nachtisch, den brennenden Plumpudding bekommen.

»Thomas, mein Sohn, sei mal so gut«, sprach Johann Buddenbrook und zog sein großes Schlüsselbund aus der Beinkleidtasche. »Im zweiten Keller rechts, das zweite Fach, hinter dem roten Bordeaux, zwei Bouteillen, du?« Und Thomas, der sich auf solche Aufträge verstand, lief fort und kam wieder mit den ganz verstaubten und umsponnenen Flaschen. Kaum aber war aus dieser unscheinbaren Hülle der goldgelbe, traubensüße alte Malvasier in die kleinen Dessertweingläser geflossen, als der Augenblick gekommen war, da Pastor Wunderlich sich erhob und, während das Gespräch verstummte, das Glas in der Hand, in angenehmen Wendungen zu toasten begann. Er sprach, den Kopf ein wenig zur Seite geneigt, ein feines und spaßhaftes Lächeln auf seinem weißen Gesicht und die freie Hand in zierlichen kleinen Gesten bewegend, in dem freien und behaglichen Plauderton, den er auch auf der Kanzel innezuhalten liebte … »Und wohlan, so lassen Sie sich denn belieben, meine wackeren Freunde, ein Glas dieses artigen Tropfens mit mir zu leeren auf die Wohlfahrt unserer vielgeehrten Wirte in ihrem neuen, so prächtigen Heim, – auf die Wohlfahrt der Familie Buddenbrook, der anwesenden sowohl wie der abwesenden Mitglieder … vivant hoch!«

›Die abwesenden Mitglieder?‹ dachte der Konsul, während er sich vor den Gläsern verbeugte, die man ihm entgegenhob. ›Sind damit nur die in Frankfurt und vielleicht die Duchamps in Hamburg gemeint, oder hat der alte Wunderlich seine Hintergedanken …?‹ Er stand auf, um sein Glas an das seines Vaters klingen zu lassen, indem er ihm herzlich in die Augen blickte.

Nun aber kam der Makler Grätjens von seinem Stuhle empor, und das nahm Zeit in Anspruch; als es aber ein Ende genommen hatte, da widmete er mit seiner etwas kreischenden Stimme ein Glas de

Nutze fuer Knoten und Kanten ausschliesslich Fakten aus diesem Quellenkontext. Erfinde keine zusaetzlichen Entitaeten oder Beziehungen.

WICHTIG: Verwende fuer das Feld 'relation' (Kanten/Beziehungen) AUSSCHLIESSLICH einen der folgenden erlaubten Begriffe aus dem aktiven Relation Set: [Ehepartner, Vater von, Mutter von, Geschwister, Stiefmutter von, Stiefbruder, Schwiegermutter von, Schwiegertochter von, Enkel von, Großvater von, Großmutter von, Onkel von, Nichte von, Cousin von, Hausfreund von, Bedienstete von, Erzieherin von, Arzt von, Geistlicher von, Schwager von]. Freie Erfindungen oder kommagetrennte Aufzaehlungen sind strikt verboten.