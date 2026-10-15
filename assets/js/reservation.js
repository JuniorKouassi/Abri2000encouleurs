(function(){
  // Fenêtre « Réserver » : 4 étapes (choix, vous, détails, envoi) puis confirmation
  var dlg = document.getElementById('reservation');
  if(!dlg || !dlg.showModal) return;
  var corps = dlg.querySelector('.resa-corps'), suivant = dlg.querySelector('.resa-suivant'), retour = dlg.querySelector('.resa-retour'),
      etapes = dlg.querySelectorAll('.resa-etapes li'), titre = dlg.querySelector('.resa-titre'), secu = dlg.querySelector('.resa-securite'),
      erreur = dlg.querySelector('.resa-erreur');
  var SITE = 'https://abri2000encouleurs.org/';

  var ICONES = {
    public:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 14h36v7a4 4 0 0 0 0 8v7H6v-7a4 4 0 0 0 0-8z" fill="#fff" fill-opacity=".28"/><path d="M6 14h36v7a4 4 0 0 0 0 8v7H6v-7a4 4 0 0 0 0-8z" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/><path d="M31 14v22" stroke="#fff" stroke-width="2.2" stroke-dasharray="3 3"/><path d="M17 20l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#fff"/></svg>',
    stand:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 20h32v20H8z" fill="#fff" fill-opacity=".28"/><path d="M6 12l4-6h28l4 6v4a5 5 0 0 1-9 3 5 5 0 0 1-9 0 5 5 0 0 1-9 0 5 5 0 0 1-9-3z" fill="#fff"/><path d="M8 20v20h32V20M20 40V29h8v11" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    partenaire:'<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17" fill="#fff" fill-opacity=".28"/><path d="M5 22l8-8 7 4 4-2 4 2 7-4 8 8-9 9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/><path d="M14 30l5 5a2.5 2.5 0 0 0 3.6-3.5M19 27l6 6a2.5 2.5 0 0 0 3.6-3.5L22 23" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 16l-6 6a2.4 2.4 0 0 0 3.4 3.4L26 21" fill="#fff"/></svg>'
  };
  var WA = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91a9.85 9.85 0 0 0-2.9-7.01zm-7.01 15.24a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 4.54 0 8.23 3.69 8.23 8.24 0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74 2.48 1.07 2.48.71 2.93.67.45-.04 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/></svg>';
  var TYPES = {
    public:{titre:'Ma place dans le public',texte:'Je viens faire la fête, seul, en famille ou entre amis.',c1:'var(--orange)',c2:'var(--rose)'},
    stand:{titre:'Un stand',texte:'Je veux vendre ou exposer mes articles aux festivaliers.',c1:'var(--vert)',c2:'var(--bleu)'},
    partenaire:{titre:'Devenir partenaire',texte:'Mon entreprise souhaite soutenir et associer son image au festival.',c1:'var(--violet)',c2:'var(--rose)'}
  };
  var s;
  function neuf(type){ s = {etape:type ? 1 : 0, type:type || null, d:{places:1}, envoi:false}; }

  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function un(cle){ return (s.d[cle] || [])[0] || ''; }
  function puces(cle, options, multi, legende){
    var v = s.d[cle] || [];
    return '<div class="resa-champ" role="group" aria-label="'+esc(legende)+'"><span class="resa-legende">'+legende+'</span><div class="resa-puces" data-cle="'+cle+'" data-multi="'+(multi?1:0)+'">'+options.map(function(o){
      return '<button type="button" aria-pressed="'+(v.indexOf(o) > -1)+'">'+esc(o)+'</button>'; }).join('')+'</div></div>';
  }
  function champ(id, label, type, ph, auto){
    return '<div class="resa-champ"><label for="resa-'+id+'">'+label+'</label><input id="resa-'+id+'" data-cle="'+id+'" type="'+type+'" value="'+esc(s.d[id])+'" placeholder="'+esc(ph)+'"'+(auto ? ' autocomplete="'+auto+'"' : '')+'></div>';
  }
  function zone(id, label, ph){
    return '<div class="resa-champ"><label for="resa-'+id+'">'+label+'</label><textarea id="resa-'+id+'" data-cle="'+id+'" placeholder="'+esc(ph)+'">'+esc(s.d[id])+'</textarea></div>';
  }
  var JOURS = ['Vendredi 25','Samedi 26','Les deux jours'];
  var facultatif = ' <i>(facultatif)</i>', multi = ' <i>(plusieurs choix possibles)</i>';

  function resume(){
    var d = s.d, l = [['Réservation', TYPES[s.type].titre], ['Nom', d.nom], ['Sexe', un('sexe')], ['WhatsApp', '+225 ' + (d.tel || '')]];
    if(d.email) l.push(['E-mail', d.email]);
    if(s.type === 'public') l.push(['Jour', un('jours')], ['Places', d.places]);
    if(s.type === 'stand') l.push(['Stand', d.enseigne], ['Pour', un('but')], ['Articles', d.articles], ['Catégorie', (d.categories || []).join(', ')], ['Jours', un('jours')], ['Électricité', un('courant')]);
    if(s.type === 'partenaire') l.push(['Structure', d.structure], ['Fonction', d.fonction], ['Partenariat', (d.nature || []).join(', ')], ['Proposition', d.message]);
    return l.filter(function(x){ return x[1]; });
  }

  var ECRANS = [
    function(){ return '<p class="resa-question">Que souhaitez-vous réserver ?</p><div class="resa-choix">'+
      Object.keys(TYPES).map(function(k){ var t = TYPES[k];
        return '<button type="button" class="resa-tuile" data-type="'+k+'"><span class="resa-icone" style="--c1:'+t.c1+';--c2:'+t.c2+'">'+ICONES[k]+'</span><span><b>'+t.titre+'</b><span>'+t.texte+'</span></span><span class="resa-fleche" aria-hidden="true">›</span></button>'; }).join('')+'</div>'; },
    function(){ return '<p class="resa-question">Faisons connaissance</p><p class="resa-aide">Ces informations servent seulement à vous recontacter.</p>'+
      champ('nom', 'Nom complet', 'text', 'Ex. : Aya Koffi', 'name')+
      puces('sexe', ['Femme','Homme'], false, 'Sexe')+
      '<div class="resa-champ"><label for="resa-tel">Numéro WhatsApp</label><div class="resa-tel"><span>+225</span><input id="resa-tel" data-cle="tel" type="tel" inputmode="tel" value="'+esc(s.d.tel)+'" placeholder="07 00 00 00 00" autocomplete="tel-national"></div></div>'+
      champ('email', 'E-mail'+facultatif, 'email', 'vous@exemple.ci', 'email')+
      '<div class="resa-piege" aria-hidden="true"><label for="resa-site">Site web</label><input id="resa-site" data-cle="site_web" type="text" tabindex="-1" autocomplete="off"></div>'; },
    function(){
      if(s.type === 'public') return '<p class="resa-question">Votre venue</p><p class="resa-libre"><b>Entrée libre.</b> Votre réservation nous aide à prévoir l’accueil.</p>'+
        puces('jours', JOURS, false, 'Quel jour venez-vous ?')+
        '<div class="resa-champ"><span class="resa-legende" id="resa-places-l">Nombre de places</span><div class="resa-compteur" role="group" aria-labelledby="resa-places-l"><button type="button" data-pas="-1" aria-label="Une place de moins">−</button><output id="resa-places" aria-live="polite">'+s.d.places+'</output><button type="button" data-pas="1" aria-label="Une place de plus">+</button></div></div>'+
        puces('source', ['Facebook','WhatsApp','Un proche','Affiche','Autre'], true, 'Comment avez-vous connu le festival ?'+facultatif);
      if(s.type === 'stand') return '<p class="resa-question">Votre stand</p>'+
        champ('enseigne', 'Nom du stand ou de l’enseigne', 'text', 'Ex. : Chez Mama Mariam')+
        puces('but', ['Vendre','Exposer','Vendre et exposer'], false, 'Vous venez pour')+
        zone('articles', 'Articles à vendre ou à exposer', 'Ex. : garba, alloco, jus naturels ; ou : tableaux, sculptures, créations en pagne')+
        puces('categories', ['Plats et grillades','Boissons','Pâtisserie','Vêtements et pagnes','Cosmétiques','Accessoires','Artisanat et art','Autre'], true, 'Catégorie'+multi)+
        '<div class="resa-duo">'+puces('jours', JOURS, false, 'Jours')+puces('courant', ['Oui','Non'], false, 'Besoin d’électricité ?')+'</div>';
      return '<p class="resa-question">Votre structure</p><div class="resa-duo">'+
        champ('structure', 'Entreprise ou structure', 'text', 'Ex. : Exemple SA', 'organization')+
        champ('fonction', 'Votre fonction'+facultatif, 'text', 'Ex. : Responsable marketing', 'organization-title')+'</div>'+
        puces('nature', ['Financier','Matériel','Logistique','Médias','Autre'], true, 'Nature du partenariat'+multi)+
        zone('message', 'Votre proposition'+facultatif, 'Ce que vous aimeriez apporter au festival'); },
    function(){ return '<p class="resa-question">On vérifie avant d’envoyer</p><dl class="resa-recap">'+
      resume().map(function(x){ return '<div><dt>'+x[0]+'</dt><dd>'+esc(x[1])+'</dd></div>'; }).join('')+'</dl>'+
      '<label class="resa-case" for="resa-accord"><input type="checkbox" id="resa-accord" checked><span>J’accepte que 147 Event me contacte sur WhatsApp au sujet de ma demande.</span></label>'; },
    function(){
      var d = s.d, prenom = esc((d.nom || '').split(' ')[0]), conf = '', couleurs = ['var(--orange)','var(--jaune)','var(--vert)','var(--rose)','var(--bleu)','var(--violet)'];
      for(var i = 0; i < 18; i++){ var a = i / 18 * Math.PI * 2; conf += '<i style="background:'+couleurs[i % 6]+';--x:'+Math.round(Math.cos(a) * 120)+'px;--y:'+Math.round(Math.sin(a) * 70)+'px"></i>'; }
      var h = '<div class="resa-confettis" aria-hidden="true">'+conf+'</div>';
      if(s.type === 'public'){
        var invite = 'https://wa.me/?text=' + encodeURIComponent('Je serai au Festival Abri2000 en Couleurs 3, les 25 et 26 décembre 2026 à la Cité Abri 2000 de Koumassi. Entrée libre, réserve ta place ici : ' + SITE);
        return h+'<div class="resa-bravo"><div class="resa-ok" aria-hidden="true">✓</div><p class="resa-question">C’est noté, '+prenom+' !</p><p class="resa-aide">'+d.places+' place'+(d.places > 1 ? 's' : '')+', '+esc(un('jours').toLowerCase())+'. On vous attend à la Cité Abri 2000, Koumassi.</p></div>'+
          '<div class="resa-fin"><a class="bouton resa-wa" href="'+invite+'" target="_blank" rel="noopener">'+WA+'Inviter mes amis sur WhatsApp</a></div>';
      }
      var message = 'https://wa.me/2250747778453?text=' + encodeURIComponent('Bonjour 147 Event, je viens de faire une demande sur le site du festival.\n' + resume().map(function(x){ return x[0] + ' : ' + x[1]; }).join('\n'));
      return h+'<div class="resa-bravo"><div class="resa-ok" aria-hidden="true">✓</div><p class="resa-question">Demande envoyée, '+prenom+' !</p><p class="resa-aide">'+(s.type === 'stand' ? 'L’équipe 147 Event étudie votre stand et vous rappelle sur WhatsApp pour l’emplacement et les modalités.' : 'L’équipe 147 Event vous rappelle sur WhatsApp pour construire le partenariat avec vous.')+'</p></div>'+
        '<div class="resa-fin"><a class="bouton resa-wa" href="'+message+'" target="_blank" rel="noopener">'+WA+'Envoyer aussi ma demande sur WhatsApp</a><p class="resa-aide">Le message est déjà rédigé, il suffit d’appuyer sur Envoyer.</p></div>'; }
  ];

  function valide(){
    var d = s.d;
    if(s.etape === 0) return !!s.type;
    if(s.etape === 1) return !!((d.nom || '').trim().length >= 2 && un('sexe') && (d.tel || '').replace(/\D/g, '').length >= 8);
    if(s.etape === 2){
      if(s.type === 'public') return !!un('jours');
      if(s.type === 'stand') return !!((d.enseigne || '').trim() && un('but') && (d.articles || '').trim().length >= 2 && un('jours') && un('courant'));
      return !!((d.structure || '').trim() && (d.nature || []).length);
    }
    if(s.etape === 3){ var c = document.getElementById('resa-accord'); return !c || c.checked; }
    return true;
  }
  function majBoutons(){
    suivant.disabled = !valide() || s.envoi;
    suivant.textContent = s.envoi ? 'Envoi…' : s.etape === 3 ? 'Envoyer ma demande' : s.etape === 4 ? 'Fermer' : 'Continuer';
    retour.hidden = s.etape === 0 || s.etape === 4;
    secu.hidden = s.etape > 1;
  }
  function rend(focus){
    erreur.hidden = true;
    corps.innerHTML = '<div class="resa-ecran">'+ECRANS[s.etape]()+'</div>';
    etapes.forEach(function(li, i){ li.className = i <= Math.min(s.etape, 3) ? 'fait' : ''; });
    titre.textContent = s.type && s.etape > 0 ? TYPES[s.type].titre : 'Réserver';
    majBoutons();
    corps.scrollTop = 0;
    if(focus !== false){ var f = corps.querySelector('input:not([tabindex="-1"]),textarea,.resa-tuile,.resa-puces button'); if(f) f.focus({preventScroll:true}); }
  }

  function envoyer(){
    var d = s.d, charge = {type:s.type, nom:d.nom, sexe:un('sexe'), tel:d.tel, email:d.email || '', site_web:d.site_web || ''};
    if(s.type === 'public'){ charge.jours = un('jours'); charge.places = d.places; charge.source = d.source || []; }
    if(s.type === 'stand'){ charge.jours = un('jours'); charge.enseigne = d.enseigne; charge.but = un('but'); charge.articles = d.articles; charge.categories = d.categories || []; charge.courant = un('courant'); }
    if(s.type === 'partenaire'){ charge.structure = d.structure; charge.fonction = d.fonction || ''; charge.nature = d.nature || []; charge.message = d.message || ''; }
    s.envoi = true; majBoutons();
    fetch('/api/reservations', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(charge)})
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if(!r.ok) throw new Error(j.erreur || 'Envoi impossible.'); }); })
      .then(function(){ s.envoi = false; s.etape = 4; rend(); })
      .catch(function(e){
        s.envoi = false; majBoutons();
        erreur.textContent = (e && e.message && e.message !== 'Failed to fetch' ? e.message : 'Connexion impossible.') + ' Réessayez, ou écrivez-nous sur WhatsApp au 07 47 77 84 53.';
        erreur.hidden = false;
      });
  }

  corps.addEventListener('click', function(e){
    var t = e.target.closest('.resa-tuile');
    if(t){ neuf(t.dataset.type); rend(); return; }
    var p = e.target.closest('.resa-puces button');
    if(p){
      var g = p.parentNode, cle = g.dataset.cle, v = p.textContent, l = s.d[cle] || [];
      l = g.dataset.multi === '1' ? (l.indexOf(v) > -1 ? l.filter(function(x){ return x !== v; }) : l.concat(v)) : [v];
      s.d[cle] = l;
      g.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', l.indexOf(b.textContent) > -1); });
      majBoutons(); return;
    }
    var c = e.target.closest('[data-pas]');
    if(c){ s.d.places = Math.max(1, Math.min(99, s.d.places + Number(c.dataset.pas))); document.getElementById('resa-places').textContent = s.d.places; }
  });
  corps.addEventListener('input', function(e){ if(e.target.dataset.cle){ s.d[e.target.dataset.cle] = e.target.value; majBoutons(); } });
  corps.addEventListener('change', function(e){ if(e.target.id === 'resa-accord') majBoutons(); });
  suivant.addEventListener('click', function(){
    if(suivant.disabled) return;
    if(s.etape === 3) return envoyer();
    if(s.etape === 4) return dlg.close();
    s.etape++; rend();
  });
  retour.addEventListener('click', function(){ s.etape = Math.max(0, s.etape - 1); if(s.etape === 0) s.type = null; rend(); });
  dlg.querySelector('.resa-fermer').addEventListener('click', function(){ dlg.close(); });
  dlg.addEventListener('click', function(e){ if(e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function(){ document.documentElement.classList.remove('resa-ouverte'); });

  function ouvrir(type){
    neuf(type); rend(false);
    document.documentElement.classList.add('resa-ouverte');
    dlg.showModal();
    var f = corps.querySelector('input:not([tabindex="-1"]),.resa-tuile'); if(f) f.focus();
  }
  document.querySelectorAll('[data-reserver]').forEach(function(b){
    b.addEventListener('click', function(e){ e.preventDefault(); ouvrir(b.dataset.reserver || null); });
  });
  if(location.hash === '#reserver') ouvrir(null);
})();
