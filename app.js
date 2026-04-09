(() => {
  const { departments, site, buildings } = window.APP_DATA;
  const params = new URLSearchParams(location.search);
  const page = document.body.dataset.page;

  const byId = Object.fromEntries(departments.map(d => [d.id, d]));
  const score = (item, q) => {
    if (!q) return 1;
    q = q.toLowerCase().trim();
    let s = 0;
    [item.name, item.category, item.building, item.floor, item.zone, item.bestEntrance, ...(item.keywords||[])].forEach(v => {
      const t = String(v).toLowerCase();
      if (t === q) s += 100;
      else if (t.startsWith(q)) s += 50;
      else if (t.includes(q)) s += 20;
    });
    return s;
  };
  const enc = encodeURIComponent;

  function buildingClass(code){ return "b" + code; }

  function renderIndex(){
    const quick = document.getElementById("quick");
    site.quick.forEach(entry => {
      quick.insertAdjacentHTML("beforeend", `<a class="button" href="search.html?q=${enc(entry.q)}">${entry.label}</a>`);
    });

    const builds = document.getElementById("buildings");
    Object.entries(buildings).forEach(([code, info]) => {
      builds.insertAdjacentHTML("beforeend", `
        <a class="tile" href="building.html?code=${code}">
          <strong>${info.label}</strong>
          <span>${info.desc}</span>
        </a>
      `);
    });

    const form = document.getElementById("searchForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = document.getElementById("searchInput").value.trim();
      if (!q) return;
      location.href = `search.html?q=${enc(q)}`;
    });
  }

  function renderSearch(){
    const q = params.get("q") || "";
    const searchInput = document.getElementById("searchInput");
    searchInput.value = q;
    const resultsEl = document.getElementById("results");
    const countEl = document.getElementById("count");

    const items = departments
      .map(d => ({...d, score: score(d, q)}))
      .filter(d => !q || d.score > 0)
      .sort((a,b) => b.score - a.score || a.name.localeCompare(b.name, "no"));

    countEl.textContent = `${items.length} treff`;

    if (!items.length) {
      resultsEl.innerHTML = `<div class="card result"><h2>Ingen treff</h2><p class="muted">Prøv et enklere ord, for eksempel akutt, barn, radiologi eller føde.</p></div>`;
    } else {
      resultsEl.innerHTML = items.map(item => `
        <a class="card result" href="department.html?id=${item.id}">
          <div>
            <h2>${item.name}</h2>
            <p class="muted">${item.category}</p>
          </div>
          <div class="badges">
            <span class="badge ${buildingClass(item.building)}">${item.building}-bygget</span>
            <span class="badge">${item.floor}. etasje</span>
          </div>
          <p><strong>Beste inngang:</strong> ${item.bestEntrance}</p>
          <p class="muted small">${item.routeHint}</p>
        </a>
      `).join("");
    }

    document.getElementById("searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const next = searchInput.value.trim();
      location.href = `search.html?q=${enc(next)}`;
    });
  }

  function renderBuilding(){
    const code = params.get("code") || "A";
    const info = buildings[code];
    const buildEl = document.getElementById("content");
    const items = departments.filter(d => d.building === code).sort((a,b)=>Number(a.floor)-Number(b.floor)||a.name.localeCompare(b.name,'no'));
    const grouped = {};
    items.forEach(i => (grouped[i.floor] ??= []).push(i));

    buildEl.innerHTML = `
      <div class="hero">
        <h1>${info.label}</h1>
        <p>${info.desc}</p>
        <p><strong>Inngang:</strong> ${info.entry}</p>
      </div>
      ${Object.keys(grouped).sort((a,b)=>Number(a)-Number(b)).map(floor => `
        <div class="section">
          <h2>${floor}. etasje</h2>
          <div class="list">
            ${grouped[floor].map(item => `
              <a class="rowbtn" href="department.html?id=${item.id}">
                <span>${item.name}</span>
                <span class="muted">${item.zone}</span>
              </a>
            `).join("")}
          </div>
        </div>
      `).join("")}
    `;
  }

  function renderDepartment(){
    const item = byId[params.get("id")];
    const el = document.getElementById("content");
    if (!item) {
      el.innerHTML = `<div class="card result"><h2>Fant ikke avdeling</h2></div>`;
      return;
    }
    const copyText = `${item.name} – ${item.building}-bygget, ${item.floor}. etasje. Beste inngang: ${item.bestEntrance}.`;
    el.innerHTML = `
      <div class="hero">
        <h1>${item.name}</h1>
        <p>${item.category}</p>
        <div class="badges">
          <span class="badge ${buildingClass(item.building)}">${item.building}-bygget</span>
          <span class="badge">${item.floor}. etasje</span>
          <span class="badge">${item.zone}</span>
        </div>
      </div>

      <div class="grid2">
        <div class="section kv">
          <div><strong>Bygg</strong><br>${item.building}-bygget</div>
          <div><strong>Etasje</strong><br>${item.floor}. etasje</div>
          <div><strong>Sone</strong><br>${item.zone}</div>
        </div>
        <div class="section kv">
          <div><strong>Beste inngang</strong><br>${item.bestEntrance}</div>
          <div><strong>Slik finner du fram</strong><br>${item.routeHint}</div>
        </div>
      </div>

      <div class="result-actions">
        <a class="button" href="building.html?code=${item.building}">Åpne bygg</a>
        <button class="button" id="copyBtn" type="button">Kopier info</button>
      </div>
    `;
    document.getElementById("copyBtn").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copyText);
        document.getElementById("copyBtn").textContent = "Kopiert";
        setTimeout(() => document.getElementById("copyBtn").textContent = "Kopier info", 1200);
      } catch {}
    });
  }

  function renderPractical(){
    const el = document.getElementById("content");
    el.innerHTML = `
      <div class="hero">
        <h1>Praktisk informasjon</h1>
        <p>Kort og oversiktlig info før du drar.</p>
      </div>
      <div class="section kv">
        <div><strong>Adresse</strong><br>${site.address}</div>
        <div><strong>Telefon</strong><br><a href="tel:${site.phone.replace(/\s+/g, "")}">${site.phone}</a></div>
        <div><strong>Parkering</strong><br>${site.parking}</div>
      </div>
      <div class="section">
        <h2>Åpningstider</h2>
        <div class="list">
          ${site.hours.map(h => `<div class="list-item">${h}</div>`).join("")}
        </div>
      </div>
    `;
  }

  if (page === "index") renderIndex();
  if (page === "search") renderSearch();
  if (page === "building") renderBuilding();
  if (page === "department") renderDepartment();
  if (page === "practical") renderPractical();
})();
