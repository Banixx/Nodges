// md2pdf.js (ES Module Syntax)

// Importieren Sie mermaid anstelle von require()
import mermaid from 'mermaid';

// Exportieren Sie die Konfiguration mit export default
export default {
  // Eine Funktion, die den Mermaid-Codeblock findet und rendert
  convertFn: async (markdown) => {
    // Initialisiert Mermaid (kann asynchron sein)
    await mermaid.initialize({
      parseOptions: {
        // Optionale Konfiguration für Mermaid hier
      }
    });

    const matches = markdown.matchAll(/```mermaid\n([\s\S]+?)\n```/g);
    let output = markdown;

    for (const match of matches) {
      // mermaid.render ist async und muss mit await aufgerufen werden
      const { svg } = await mermaid.render('diagram', match[1]);
      output = output.replace(match[0], svg);
    }
    
    // Gibt den Markdown-Text zurück, jetzt mit SVG-Bildern anstelle des Codes
    return output;
  }
};
