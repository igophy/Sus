# SUS Ullandhaug Navigator v3

Statisk webapp som fungerer direkte på GitHub Pages uten build-steg.

## Autoritative filer (gjeldende frontend)
Denne repoen bruker **håndskrevet frontend** som autoritativ kilde:
- `index.html`
- `app.js`
- `data.js`
- `styles.css`

Bundlet frontend-filer (`index-Dm9RTJdR.js` og `index-D8sbqhOo.css`) er fjernet og skal ikke publiseres sammen med legacy-filene.

## Innhold
- tydelig byggmarkering på alle avdelingskort
- hurtigvalg for vanlige mål
- byggoversikt uten kart
- kompakt og detaljert visning
- favoritter
- nylig åpnet
- siste søk
- del og kopier-funksjon
- mørkere, mer moderne design

## Deploy-flyt (GitHub Pages)
1. Oppdater innhold i autoritative filer (`index.html`, `app.js`, `data.js`, `styles.css`).
2. Verifiser lokalt at `index.html` fortsatt laster `data.js` og `app.js`.
3. Commit og push til branch som publiseres (eller til `docs/` dersom Pages er satt opp der).
4. Sørg for at `index.html` ligger i roten av publisert mappe.
5. CI-workflow `Validate frontend variant` må være grønn; den feiler hvis både legacy- og bundle-variant finnes samtidig.

## CI-validering
Workflowen i `.github/workflows/validate-frontend-variant.yml` feiler dersom begge varianter publiseres samtidig.
