(function(){
  // Compte à rebours jusqu'au 25 décembre 2026 (heure d'Abidjan, UTC+0)
  var cible = Date.UTC(2026,11,25,0,0,0);
  var r = document.getElementById('rebours');
  function maj(){
    var d = Math.max(0, cible - Date.now());
    var j = Math.floor(d/864e5), h = Math.floor(d%864e5/36e5), m = Math.floor(d%36e5/6e4);
    r.querySelector('[data-u="j"]').textContent = j;
    r.querySelector('[data-u="h"]').textContent = String(h).padStart(2,'0');
    r.querySelector('[data-u="m"]').textContent = String(m).padStart(2,'0');
    r.querySelector('[data-u="s"]').textContent = String(Math.floor(d%6e4/1e3)).padStart(2,'0');
    if(d===0){ r.querySelector('span').textContent = 'C’est la fête !'; }
  }
  maj(); setInterval(maj, 1000);

  // Filtres de la galerie
  var boutons = document.querySelectorAll('.filtres button');
  var photos = Array.prototype.slice.call(document.querySelectorAll('#mur figure'));
  boutons.forEach(function(b){
    b.addEventListener('click', function(){
      boutons.forEach(function(x){ x.setAttribute('aria-pressed', x===b ? 'true' : 'false'); });
      var f = b.dataset.f;
      photos.forEach(function(p){ p.hidden = !(f==='tout' || p.dataset.c===f); });
    });
  });

  // Visionneuse
  var v = document.getElementById('visionneuse'), vi = v.querySelector('img'), vc = v.querySelector('figcaption'), cur = 0;
  function visibles(){ return photos.filter(function(p){ return !p.hidden; }); }
  function montre(i){
    var l = visibles(); if(!l.length) return;
    cur = (i + l.length) % l.length;
    var img = l[cur].querySelector('img');
    vi.src = img.src; vi.alt = img.alt; vc.textContent = l[cur].querySelector('figcaption').textContent;
  }
  photos.forEach(function(p){
    p.querySelector('button').addEventListener('click', function(){
      montre(visibles().indexOf(p)); v.hidden = false; v.querySelector('.fermer').focus();
    });
  });
  function ferme(){ v.hidden = true; }
  v.querySelector('.fermer').addEventListener('click', ferme);
  v.querySelector('.prec').addEventListener('click', function(){ montre(cur-1); });
  v.querySelector('.suiv').addEventListener('click', function(){ montre(cur+1); });
  v.addEventListener('click', function(e){ if(e.target===v) ferme(); });
  document.addEventListener('keydown', function(e){
    if(v.hidden) return;
    if(e.key==='Escape') ferme();
    if(e.key==='ArrowLeft') montre(cur-1);
    if(e.key==='ArrowRight') montre(cur+1);
  });

  // Copier un numéro
  var t = document.getElementById('toast'), tt;
  function toast(msg){ t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(function(){ t.hidden = true; }, 2200); }
  document.querySelectorAll('[data-copie]').forEach(function(b){
    b.addEventListener('click', function(){
      var num = b.parentNode.firstChild.textContent.trim();
      try {
        navigator.clipboard.writeText(num).then(function(){ toast('Numéro copié : ' + num); }, function(){ selectionne(b); });
      } catch(e){ selectionne(b); }
    });
  });
  function selectionne(b){
    var s = window.getSelection(), rg = document.createRange();
    rg.selectNodeContents(b.parentNode.firstChild); s.removeAllRanges(); s.addRange(rg);
    toast('Numéro sélectionné, copiez-le avec Ctrl+C');
  }
})();
