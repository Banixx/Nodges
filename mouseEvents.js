import { Vector2 } from 'three';

const mouse = new Vector2();

function onMouseMove(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  const tooltip = document.getElementById('tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
  tooltip.innerHTML = `X-Koordinate: ${mouse.x.toFixed(2)}<br>Y-Koordinate: ${mouse.y.toFixed(2)}`;
}

window.addEventListener('mousemove', onMouseMove, false);