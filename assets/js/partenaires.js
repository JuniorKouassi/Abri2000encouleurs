(function(){
  // Vedette tournante des partenaires : un logo en grand à tour de rôle, les autres cliquables à côté
  var scene = document.getElementById('pv-scene');
  if(!scene) return;
  var boutons = Array.prototype.slice.call(document.querySelectorAll('#pv-liste button'));
  var logo = document.getElementById('pv-logo'), nom = document.getElementById('pv-nom'), desc = document.getElementById('pv-desc'),
      niveau = document.getElementById('pv-niveau'), barre = document.getElementById('pv-barre'),
      bPause = document.getElementById('pv-pause'), commandes = scene.querySelector('.pv-commandes');
  var DUREE = 4500, courant = 0, pause = window.matchMedia('(prefers-reduced-motion: reduce)').matches, survol = false, t0 = performance.now(), visible = true;
  commandes.hidden = false;

  function montre(k){
    courant = (k + boutons.length) % boutons.length; t0 = performance.now();
    var b = boutons[courant], img = b.querySelector('img');
    logo.src = img.getAttribute('src'); logo.width = b.dataset.w; logo.height = b.dataset.h;
    logo.alt = 'Logo ' + b.dataset.nom.replace('&amp;', '&');
    nom.textContent = b.dataset.nom; desc.textContent = b.dataset.desc; niveau.textContent = b.dataset.niveau;
    var g = logo.parentNode; g.style.animation = 'none'; void g.offsetWidth; g.style.animation = '';
    boutons.forEach(function(x, n){ x.setAttribute('aria-current', n === courant ? 'true' : 'false'); });
  }
  function majPause(){
    bPause.textContent = pause ? '▶' : '❚❚';
    bPause.setAttribute('aria-label', pause ? 'Reprendre le défilement' : 'Mettre en pause');
    t0 = performance.now();
  }
  boutons.forEach(function(b, k){ b.addEventListener('click', function(){ montre(k); }); });
  document.getElementById('pv-prec').addEventListener('click', function(){ montre(courant - 1); });
  document.getElementById('pv-suiv').addEventListener('click', function(){ montre(courant + 1); });
  bPause.addEventListener('click', function(){ pause = !pause; majPause(); });
  scene.addEventListener('mouseenter', function(){ survol = true; });
  scene.addEventListener('mouseleave', function(){ survol = false; t0 = performance.now(); });
  scene.addEventListener('focusin', function(){ survol = true; });
  scene.addEventListener('focusout', function(){ survol = false; t0 = performance.now(); });
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){ visible = e[0].isIntersecting; t0 = performance.now(); }).observe(scene);
  }
  majPause();

  (function boucle(t){
    if(pause){ barre.style.width = '0%'; }
    else if(!survol && visible){
      var f = (t - t0) / DUREE;
      if(f >= 1){ montre(courant + 1); f = 0; }
      barre.style.width = (f * 100) + '%';
    } else { t0 = t - parseFloat(barre.style.width || 0) / 100 * DUREE; }
    requestAnimationFrame(boucle);
  })(performance.now());
})();
