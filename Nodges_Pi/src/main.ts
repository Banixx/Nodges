console.log('Nodges Pi Application Initialized');

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = `
    <div style="font-family: sans-serif; padding: 2rem; background: #1e1e2e; color: #cdd6f4; border-radius: 8px; max-width: 600px; margin: 2rem auto;">
      <h2>Nodges Pi App</h2>
      <p>Vite Frontend laeuft erfolgreich im Docker Container.</p>
    </div>
  `;
}
