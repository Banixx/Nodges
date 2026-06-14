# Implementierung des Tab-Mausrad-Scrollens und der Bildlaufleiste

In diesem Dokument wird die technische Implementierung des horizontalen Scrollens per Mausrad und der einblendbaren Bildlaufleiste für die Sidebar-Tabs beschrieben.

## 1. HTML-Struktur-Erweiterung (index.html)

Der Navigationsbereich der Tabs (`.sidebar-tabs`) wurde in einen relativen Container (`.sidebar-tabs-container`) gehüllt. Dieser beherbergt nun auch die Custom-Scrollbar-Elemente, damit diese über die gesamte Breite angezeigt werden können, ohne von der Maskierungsfunktion (`mask-image`) der Tab-Liste abgeschnitten zu werden.

```html
<!-- Tab Navigation Container -->
<div class="sidebar-tabs-container">
    <nav class="sidebar-tabs">
        <button class="sidebar-tab active" data-tab="tab-system">System</button>
        <button class="sidebar-tab" data-tab="tab-layers">Ebenen</button>
        <button class="sidebar-tab" data-tab="tab-files">Files</button>
        <button class="sidebar-tab" data-tab="tab-view">Ansicht</button>
        <button class="sidebar-tab" data-tab="tab-create">Create</button>
        <button class="sidebar-tab" data-tab="tab-mappings">Mappings</button>
        <button class="sidebar-tab" data-tab="tab-layout">Layout</button>
        <button class="sidebar-tab" data-tab="tab-dev">Dev</button>
    </nav>
    <div id="sidebarTabsScrollbar" class="sidebar-tabs-scrollbar">
        <div id="sidebarTabsScrollbarThumb" class="sidebar-tabs-scrollbar-thumb"></div>
    </div>
</div>
```

## 2. CSS-Styling (src/styles/main.css)

Der untere Rahmen wurde von `.sidebar-tabs` auf den neuen Container `.sidebar-tabs-container` übertragen. Die Scrollbar und der Scroll-Regler (Thumb) wurden für flüssiges Ein- und Ausblenden über CSS-Transitions konfiguriert. Um das Scrollen nicht zu blockieren, wurde `pointer-events: none` hinzugefügt.

```css
.sidebar-tabs-container {
  position: relative;
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-tabs {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: none;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  mask-image: linear-gradient(to right, transparent, black 30px, black calc(100% - 30px), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 30px, black calc(100% - 30px), transparent);
}

/* Custom Horizontal Scrollbar for Tabs */
.sidebar-tabs-scrollbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.05);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 10;
}

.sidebar-tabs-scrollbar.visible {
  opacity: 1;
}

.sidebar-tabs-scrollbar-thumb {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--accent-color);
  border-radius: 1.5px;
  width: 0;
}
```

## 3. JavaScript-Logik (index.html)

Die Implementierung fügt drei Kernfunktionen hinzu:

1. **Mausrad-Umleitung**: Vertikale Scrollrad-Bewegungen (`deltaY`) werden abgefangen und direkt zur horizontalen Scrollposition (`scrollLeft`) des Tab-Containers addiert.
2. **Scrollbar-Berechnung**: Bei jeder Scroll-Bewegung wird die Breite und Position des Reglers proportional zur sichtbaren Fensterbreite im Verhältnis zur Gesamtbreite der Tabs berechnet und mittels performantem `transform: translateX(...)` verschoben.
3. **Fade-In / Fade-Out**: Die Scrollbar wird bei Scroll-Aktivität sofort eingeblendet. Nach 800 Millisekunden ohne weitere Scroll-Bewegung blendet sie sich automatisch wieder aus.
4. **Responsive Anpassung**: Ein `ResizeObserver` sorgt dafür, dass sich die Scrollbar auch bei Größenänderungen des Browserfensters sofort anpasst.

```javascript
const tabsContainer = document.querySelector('.sidebar-tabs');
const scrollbar = document.getElementById('sidebarTabsScrollbar');
const scrollbarThumb = document.getElementById('sidebarTabsScrollbarThumb');
let scrollTimeout;

function updateScrollbar() {
    if (!tabsContainer || !scrollbar || !scrollbarThumb) return;
    const clientWidth = tabsContainer.clientWidth;
    const scrollWidth = tabsContainer.scrollWidth;
    const scrollLeft = tabsContainer.scrollLeft;

    if (scrollWidth <= clientWidth) {
        scrollbar.style.display = 'none';
        return;
    }

    scrollbar.style.display = 'block';
    const ratio = clientWidth / scrollWidth;
    const thumbWidth = clientWidth * ratio;
    const maxScrollLeft = scrollWidth - clientWidth;
    const maxThumbLeft = clientWidth - thumbWidth;
    const thumbLeft = maxScrollLeft > 0 ? (scrollLeft / maxScrollLeft) * maxThumbLeft : 0;

    scrollbarThumb.style.width = `${thumbWidth}px`;
    scrollbarThumb.style.transform = `translateX(${thumbLeft}px)`;
}

if (tabsContainer) {
    tabsContainer.addEventListener('wheel', (e) => {
        const scrollAmount = e.deltaY || e.deltaX;
        if (scrollAmount !== 0) {
            e.preventDefault();
            tabsContainer.scrollLeft += scrollAmount;
        }
    }, { passive: false });

    tabsContainer.addEventListener('scroll', () => {
        updateScrollbar();
        
        if (scrollbar) {
            scrollbar.classList.add('visible');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                scrollbar.classList.remove('visible');
            }, 800);
        }
    });

    updateScrollbar();

    if (window.ResizeObserver) {
        new ResizeObserver(updateScrollbar).observe(tabsContainer);
    } else {
        window.addEventListener('resize', updateScrollbar);
    }
}
```
