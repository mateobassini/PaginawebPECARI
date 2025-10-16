// assets/js/concesionarios.js
(function(){
  const select = document.getElementById('provinciaSelect');
  const out = document.getElementById('dealerResult');
  const mapEl = document.getElementById('map');
  if (!select || !out || !mapEl) return;

  // 🗺️ Inicializar mapa en Argentina
  const AR_CENTER = [-38.4161, -63.6167];
  const map = L.map('map', { scrollWheelZoom: false }).setView(AR_CENTER, 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  let marker = L.marker(AR_CENTER).addTo(map);

  // 📍 Datos de dealers (completa los que faltan)
  const dealers = {
    'Entre Ríos': { 
      nombre: 'Centro de Atención',
      localidad: 'Concepción del Uruguay',
      tel: '+54 9 3442 507056',
      email: 'contacto@pecari.com.ar',
      img: 'https://www.pecari.com.ar/images/dealers/entrerios.jpg',
      coords: [-32.4846, -58.2320]
    },
    'Buenos Aires': { 
      nombre: 'Asesor Buenos Aires',
      localidad: 'La Plata',
      tel: '+54 9 11 5555 5555',
      email: 'ba@pecari.com.ar',
      img: 'https://www.pecari.com.ar/images/dealers/buenosaires.jpg',
      coords: [-34.9214, -57.9544]
    }
    // 🔸 Agregar resto: { nombre, localidad, tel, email, img, coords:[lat,lng] }
  };

  // 🔹 Restaurar selección guardada
  const savedProvince = localStorage.getItem('provinciaSeleccionada');
  if (savedProvince && dealers[savedProvince]) {
    select.value = savedProvince;
    renderDealer(savedProvince);
  } else {
    marker.setLatLng(AR_CENTER);
  }

  // 🔹 Al cambiar provincia
  select.addEventListener('change', () => {
    const provincia = select.value;
    if (dealers[provincia]) {
      localStorage.setItem('provinciaSeleccionada', provincia);
      renderDealer(provincia);
    } else {
      localStorage.removeItem('provinciaSeleccionada');
      out.innerHTML = '<span class="muted">Pronto publicaremos el contacto de tu zona.</span>';
      map.setView(AR_CENTER, 4);
      marker.setLatLng(AR_CENTER);
      marker.bindPopup('').closePopup();
    }
  });

  function renderDealer(provincia) {
    const d = dealers[provincia];
    out.innerHTML = `
      <div class="dealer-card">
        <img src="${d.img}" alt="${d.nombre}">
        <strong style="display:block; font-size:1.1rem;">${d.nombre}</strong>
        <span style="color:#555; display:block; margin-bottom:6px;">${d.localidad} (${provincia})</span>
        <a href="tel:${d.tel}" style="display:block;">${d.tel}</a>
        <a href="mailto:${d.email}" style="display:block;">${d.email}</a>
      </div>
    `;

    if (Array.isArray(d.coords) && d.coords.length === 2) {
      const [lat, lng] = d.coords;
      marker.setLatLng([lat, lng]).bindPopup(`
        <strong>${d.nombre}</strong><br>
        ${d.localidad} (${provincia})<br>
        <a href="tel:${d.tel}">${d.tel}</a> · <a href="mailto:${d.email}">${d.email}</a>
      `).openPopup();
      map.setView([lat, lng], 12);
    } else {
      map.setView(AR_CENTER, 4);
      marker.setLatLng(AR_CENTER);
      marker.bindPopup('').closePopup();
    }

    // Ajuste por si el contenedor cambia tamaño
    setTimeout(() => map.invalidateSize(), 100);
  }
})();
