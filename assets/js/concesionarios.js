(function () {
  const select = document.getElementById('provinciaSelect');
  const out = document.getElementById('dealerResult');
  const mapEl = document.getElementById('map');
  if (!select || !out || !mapEl) return;

  const AR_CENTER = [-38.4161, -63.6167];

  // 🗺️ Mapa
  const map = L.map('map', { scrollWheelZoom: false }).setView(AR_CENTER, 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  // ⛳️ Soporte para múltiples marcadores
  const markersLayer = L.layerGroup().addTo(map);

  let dealers = {};

  // ---- Cargar JSON y armar UI
  fetch('assets/data/dealers.json')
    .then(r => {
      if (!r.ok) throw new Error('No se pudo cargar dealers.json');
      return r.json();
    })
    .then(data => {
      dealers = data || {};
      // Llenar el select con las claves del JSON
      Object.keys(dealers).sort().forEach(prov => {
        const opt = document.createElement('option');
        opt.value = prov;
        opt.textContent = prov;
        select.appendChild(opt);
      });

      // Restaurar provincia guardada
      const savedProvince = localStorage.getItem('provinciaSeleccionada');
      if (savedProvince && dealers[savedProvince]) {
        select.value = savedProvince;
        renderDealers(savedProvince);
      } else {
        map.setView(AR_CENTER, 4);
      }
    })
    .catch(err => {
      console.error(err);
      out.innerHTML = '<span class="muted">No pudimos cargar los concesionarios. Intentalo más tarde.</span>';
    });

  // Cambio de provincia
  select.addEventListener('change', () => {
    const provincia = select.value;
    if (dealers[provincia]) {
      localStorage.setItem('provinciaSeleccionada', provincia);
      renderDealers(provincia);
    } else {
      localStorage.removeItem('provinciaSeleccionada');
      out.innerHTML = '<span class="muted">Pronto publicaremos el contacto de tu zona.</span>';
      markersLayer.clearLayers();
      map.setView(AR_CENTER, 4);
    }
  });

  // 👉 Nueva versión: soporta 1..N dealers por provincia (objeto o array)
  function renderDealers(provincia) {
    const value = dealers[provincia];
    const list = Array.isArray(value) ? value : [value]; // normaliza

    // Tarjetas
    out.innerHTML = list
      .map(d => {
        const hasCoords = Array.isArray(d?.coords) && d.coords.length === 2;
        const mapsLink = hasCoords
          ? `https://www.google.com/maps?q=${d.coords[0]},${d.coords[1]}`
          : null;

        return `
          <div class="dealer-card" style="margin-bottom:12px;">
            ${d?.img ? `<img src="${d.img}" alt="${d.nombre ?? ''}">` : ''}
            <strong style="display:block;font-size:1.1rem;">${d?.nombre ?? ''}</strong>
            <span style="color:#555;display:block;margin-bottom:6px;">${d?.localidad ?? ''} (${provincia})</span>
            ${d?.tel ? `<a href="tel:${d.tel}" style="display:block;">${d.tel}</a>` : ''}
            ${d?.email ? `<a href="mailto:${d.email}" style="display:block;">${d.email}</a>` : ''}
            ${
              mapsLink
                ? `<a href="${mapsLink}" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;text-decoration:underline;">Ver en Google Maps</a>`
                : ''
            }
          </div>
        `;
      })
      .join('');

    // Marcadores
    markersLayer.clearLayers();
    const points = [];

    list.forEach(d => {
      if (Array.isArray(d?.coords) && d.coords.length === 2) {
        const [lat, lng] = d.coords;
        points.push([lat, lng]);

        L.marker([lat, lng])
          .bindPopup(`
            <strong>${d?.nombre ?? ''}</strong><br>
            ${d?.localidad ?? ''} (${provincia})<br>
            ${d?.tel ? `<a href="tel:${d.tel}">${d.tel}</a>` : ''} 
            ${d?.email ? `· <a href="mailto:${d.email}">${d.email}</a>` : ''}<br>
            <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank">Abrir en Maps</a>
          `)
          .addTo(markersLayer);
      }
    });

    // Enfoque del mapa
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds.pad(0.2));
    } else {
      map.setView(AR_CENTER, 4);
    }

    setTimeout(() => map.invalidateSize(), 100);
  }
})();
