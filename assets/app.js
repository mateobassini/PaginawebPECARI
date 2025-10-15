// Toggle menú móvil con estado accesible
(function(){
  const burger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  if(burger && nav){
    burger.addEventListener('click',()=>{
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      if(open){
        nav.style.position='absolute';
        nav.style.inset='64px 0 auto 0';
        nav.style.background='#fff';
        nav.style.padding='12px 20px';
        nav.style.display='grid';
        nav.style.gap='10px';
        nav.style.boxShadow='var(--shadow)';
      }else{
        nav.removeAttribute('style');
      }
    });
  }
})();

// Scroll suave a #contacto (y desde páginas internas vuelve al Home)
(function(){
  const links=[...document.querySelectorAll('[data-scroll-to]')];
  links.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const sel=btn.getAttribute('data-scroll-to');
      const goHome=btn.hasAttribute('data-go-home');
      if(goHome && window.location.pathname!== '/' && !window.location.pathname.endsWith('index.html')){
        sessionStorage.setItem('scrollTo', sel);
        window.location.href = '/';
        return;
      }
      const target=document.querySelector(sel);
      if(target){ target.scrollIntoView({behavior:'smooth'}); }
    });
  });
  const pending = sessionStorage.getItem('scrollTo');
  if(pending){
    sessionStorage.removeItem('scrollTo');
    const t = document.querySelector(pending);
    if(t){ setTimeout(()=>t.scrollIntoView({behavior:'smooth'}), 180); }
  }
})();

// Año dinámico en el footer
(function(){
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
})();

// Catálogo simulado con categorías y búsqueda (productos.html)
(function(){
  const el = document.getElementById('catalogo');
  if(!el) return;
  const chips = document.getElementById('chips');
  const search = document.getElementById('search');
  const data=[
    {id:1, nombre:'Excavador Dynamic RS450', cat:'excavadores', img:'assets/prod-excavador.webp'},
    {id:2, nombre:'Hoyadora Power HP450', cat:'hoyadoras', img:'assets/prod-hoyadora.webp'},
    {id:3, nombre:'Vibrocompactador Dual VD 120/150', cat:'vibrocompactadores', img:'assets/prod-vibro.webp'},
    {id:4, nombre:'Zanjadora ZA400', cat:'zanjadoras', img:'assets/prod-zanjadora.webp'},
    {id:5, nombre:'Portapallet Extreme', cat:'portapallets', img:'assets/prod-portapallets.webp'},
    {id:6, nombre:'Pala Hormigonera', cat:'hormigoneros', img:'assets/prod-hormigonera.webp'}
  ];
  const cats=[...new Set(data.map(d=>d.cat))];

  function render(items){
    el.innerHTML = items.map(i=>`
      <article class="card" id="p-${i.id}">
        <img src="${i.img}" alt="${i.nombre}">
        <div class="card-body">
          <h3>${i.nombre}</h3>
          <p class="muted">${i.cat.replace(/^(.)/,m=>m.toUpperCase())}</p>
          <a class="link-arrow" href="#" aria-label="Más información de ${i.nombre}">Más info</a>
        </div>
      </article>
    `).join('');
  }

  function renderChips(){
    chips.innerHTML = ['todos', ...cats].map((c,i)=>`<button class="chip" role="tab" aria-selected="${i===-1 ? 'true':'false'}" aria-pressed="false" data-cat="${c}">${c[0].toUpperCase()+c.slice(1)}</button>`).join('');
    chips.addEventListener('click', e=>{
      const b=e.target.closest('.chip'); if(!b) return;
      [...chips.children].forEach(x=>{x.classList.remove('active'); x.setAttribute('aria-pressed','false'); x.setAttribute('aria-selected','false');});
      b.classList.add('active'); b.setAttribute('aria-pressed','true'); b.setAttribute('aria-selected','true');
      const cat=b.dataset.cat;
      const q=search.value.toLowerCase().trim();
      const filtered = data.filter(d=> (cat==='todos'||d.cat===cat) && d.nombre.toLowerCase().includes(q));
      render(filtered);
    });
  }

  function handleSearch(){
    const active = chips.querySelector('.chip.active');
    const cat = active ? active.dataset.cat : 'todos';
    const q = search.value.toLowerCase().trim();
    render(data.filter(d=> (cat==='todos'||d.cat===cat) && d.nombre.toLowerCase().includes(q)));
  }

  render(data); renderChips();
  const firstChip = chips.querySelector('.chip'); if(firstChip){ firstChip.classList.add('active'); firstChip.setAttribute('aria-selected','true'); firstChip.setAttribute('aria-pressed','true'); }
  search.addEventListener('input', handleSearch);

  if(window.location.hash){
    const hash = window.location.hash.replace('#','');
    const btn=[...chips.children].find(b=>b.dataset.cat===hash);
    if(btn){ btn.click(); }
  }
})();

// Concesionarios – ejemplo mínimo (mock)
(function(){
  const select=document.getElementById('provinciaSelect');
  const out=document.getElementById('dealerResult');
  if(!select||!out) return;
  const dealers={
    'Entre Ríos': { nombre:'Centro de Atención', tel:'+54 9 3442 507056', email:'contacto@pecari.com.ar' },
    'Buenos Aires': { nombre:'Asesor Buenos Aires', tel:'+54 9 11 5555 5555', email:'ba@pecari.com.ar' }
    // Agregar el resto desde su base real
  };
  select.addEventListener('change',()=>{
    const d=dealers[select.value];
    out.innerHTML = d ? `<strong>${d.nombre}</strong><br><a href="tel:${d.tel}">${d.tel}</a><br><a href="mailto:${d.email}">${d.email}</a>` : '<span class="muted">Pronto publicaremos el contacto de tu zona.</span>';
  });
})();

// Validación básica de contacto (sin backend). Reemplazar por POST real (Formspree/Email/API)
(function(){
  const form=document.getElementById('contactForm');
  const fb=document.getElementById('formFeedback');
  if(!form||!fb) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!form.checkValidity()){
      fb.textContent='Completá los campos requeridos';
      fb.style.color='crimson';
      return;
    }
    fb.textContent='¡Gracias! Te contactaremos a la brevedad.';
    fb.style.color='green';
    form.reset();
  });
})();

