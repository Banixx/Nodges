class Tooltip {
  constructor(tooltipId) {
    this.tooltip = document.getElementById(tooltipId);
    if (!this.tooltip) {
      console.error(`Tooltip with id ${tooltipId} not found.`);
    }
    // Initialisiere den Tooltip als unsichtbar
    this.tooltip.style.opacity = "0";
    this.tooltip.style.transition = "opacity 0.5s";
    this.tooltip.style.display = "block"; // Wichtig, damit der Übergang funktioniert
  }

  show(content, x, y) {
    if (!this.tooltip) return;

    this.tooltip.innerHTML = content;
    this.updatePosition(x, y);
    this.tooltip.style.opacity = '1'; // Mache den Tooltip sichtbar
  }

  updatePosition(x, y) {
    const tooltipWidth = this.tooltip.offsetWidth;
    const tooltipHeight = this.tooltip.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Berechnet die optimale Position, um Überläufe zu verhindern
    let posX = x + 20;
    let posY = y - 20;

    if (posX + tooltipWidth > windowWidth) {
      posX = windowWidth - tooltipWidth - 20;
    }
    if (posY + tooltipHeight > windowHeight) {
      posY = windowHeight - tooltipHeight - 20;
    }
    if (posY < 0) {
      posY = 20;
    }

    this.tooltip.style.left = `${posX}px`;
    this.tooltip.style.top = `${posY}px`;
  }

  hide() {
    if (this.tooltip) {
        this.tooltip.style.opacity = '0'; // Mache den Tooltip sichtbar
    }
  }
}

export default Tooltip;
