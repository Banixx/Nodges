# Plan: Sicheres BYOK Deployment (Bring Your Own Key)

## Ausgangssituation
Nodges wird als Static Web App über GitHub Pages gehostet. Jüngste Ereignisse (GitHub Push Protection wegen eines hartcodierten API-Keys) haben gezeigt, wie wichtig es ist, Secrets strikt vom Code zu trennen. Das Ziel ist es, das Projekt sicher online zugänglich zu machen, ohne Keys im Code zu speichern, und den Nutzern eine reibungslose Authentifizierung zu ermöglichen.

## Erkenntnisse aus vergangenen Sessions
1. **Der "Firebase Proxy"-Versuch (v0.102.4):** Es gab bereits einen Versuch, eine Firebase Cloud Function als Proxy aufzusetzen. Die Implementierung scheiterte letztendlich an Login-Konflikten in der Firebase CLI. Der Code für den Proxy (`firebase-proxy/`) existiert jedoch noch.
2. **Der "Push Protection"-Fix (v0.102.5):** Nach der Blockierung des Repositories wurde der hartcodierte Key entfernt. Aktuell ist das UI so konfiguriert, dass der Nutzer seinen eigenen Key über das `CreatePanel` eingeben muss. Dieser wird im `localStorage` sicher hinterlegt.

## Optionen für das zukünftige Deployment

### Option A: Striktes "Bring Your Own Key" (Lokal)
- **Konzept:** Wir belassen es bei der lokalen Eingabe im Browser.
- **Vorteile:** 
  - Keine Backend-Infrastruktur nötig.
  - 100% Sicherheit für den Betreiber, da keine Keys kompromittiert werden können.
  - Völlig kostenfreies Hosting auf GitHub Pages.
- **Nachteile:**
  - Nutzer ohne eigenen OpenRouter-Key können die generativen Features der App nicht nutzen.
- **Maßnahmen:** Das UI für die Eingabe muss maximal intuitiv gestaltet werden. Hinweise darauf, wie man einen Key bekommt, sollten im `CreatePanel` stehen.

### Option B: Serverless Proxy (z.B. Vercel, Deno Deploy oder Cloudflare)
- **Konzept:** Falls das Ziel weiterhin ist, einen "Built-In" Key anzubieten, empfehle ich den Einsatz eines Serverless Proxies.
- **Vorteile:**
  - Extrem einfache Einrichtung (oft per Web-Interface möglich, keine komplexen CLI-Logins nötig).
  - Anbieter wie **Vercel** oder **Deno Deploy** erfordern für den Free-Tier **keine Kreditkarte**. Cloudflare Workers meistens auch nicht, kann aber zur Verifizierung manchmal danach fragen.
  - Kostenloser Tier ist bei allen sehr großzügig und perfekt als einfacher CORS-Proxy.
- **Nachteile:**
  - Es muss eine externe Infrastruktur gepflegt werden.
  - Missbrauchsgefahr: Wenn die URL des Proxies bekannt wird, könnte dein Kontingent aufgebraucht werden. Hier müsste man eine Domain-Restriktion (CORS auf `banixx.github.io` limitieren) einbauen.

## Empfohlene nächsten Schritte
1. **Entscheidung fällen:** Möchtest du bei der reinen BYOK-Lösung bleiben (Option A) oder möchtest du weiterhin einen sicheren Proxy für deinen eigenen Key einrichten (Option B)?
2. **Wenn Option A:** Wir optimieren das `CreatePanel` visuell und inhaltlich, damit Nutzer genau wissen, wo sie ihren Key eintragen müssen. Der alte `firebase-proxy` Ordner kann dann gelöscht werden.
3. **Wenn Option B:** Wir verwerfen den Firebase-Ansatz und ich erstelle dir eine einfache Anleitung für einen Cloudflare Worker.

Bitte gib mir kurz Bescheid, welchen Weg du bevorzugst, dann setze ich das direkt um!
