// Demandes du bouton « Réserver » : validation, enregistrement dans D1, mail à l'équipe.

const JOURS = ['Vendredi 25', 'Samedi 26', 'Les deux jours'];
const SOURCES = ['Facebook', 'WhatsApp', 'Un proche', 'Affiche', 'Autre'];
const BUTS = ['Vendre', 'Exposer', 'Vendre et exposer'];
const CATEGORIES = ['Plats et grillades', 'Boissons', 'Pâtisserie', 'Vêtements et pagnes', 'Cosmétiques', 'Accessoires', 'Artisanat et art', 'Autre'];
const NATURES = ['Financier', 'Matériel', 'Logistique', 'Médias', 'Autre'];
export const SUIVIS = ['Nouveau', 'Rappelé', 'Validé', 'Refusé'];
const TITRES = { public: 'Place dans le public', stand: 'Stand', partenaire: 'Partenariat' };

class ErreurSaisie extends Error {}

function texte(v, nom, { min = 1, max = 200, facultatif = false } = {}) {
  const s = typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '';
  if (!s && facultatif) return '';
  if (s.length < min || s.length > max) throw new ErreurSaisie(`Le champ « ${nom} » est invalide.`);
  return s;
}
function parmi(v, liste, nom) {
  if (!liste.includes(v)) throw new ErreurSaisie(`Le champ « ${nom} » est invalide.`);
  return v;
}
function plusieurs(v, liste, nom, { min = 0 } = {}) {
  const l = Array.isArray(v) ? [...new Set(v)] : [];
  if (l.length < min || l.some((x) => !liste.includes(x))) throw new ErreurSaisie(`Le champ « ${nom} » est invalide.`);
  return l;
}

// Contrôle la demande reçue et la ramène aux seules colonnes attendues.
export function valider(c) {
  const type = parmi(c.type, Object.keys(TITRES), 'type');
  const tel = String(c.tel || '').replace(/[^\d]/g, '');
  if (tel.length < 8 || tel.length > 15) throw new ErreurSaisie('Le numéro WhatsApp est invalide.');
  const email = texte(c.email, 'e-mail', { max: 120, facultatif: true });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErreurSaisie("L'adresse e-mail est invalide.");

  const r = {
    type,
    nom: texte(c.nom, 'nom complet', { min: 2, max: 80 }),
    sexe: parmi(c.sexe, ['Femme', 'Homme'], 'sexe'),
    tel,
    email,
    jours: '',
    places: 0,
    details: {},
  };
  if (type === 'public') {
    r.jours = parmi(c.jours, JOURS, 'jour');
    r.places = Number(c.places);
    if (!Number.isInteger(r.places) || r.places < 1 || r.places > 99) throw new ErreurSaisie('Le nombre de places est invalide.');
    r.details = { source: plusieurs(c.source, SOURCES, 'connu par') };
  } else if (type === 'stand') {
    r.jours = parmi(c.jours, JOURS, 'jours');
    r.details = {
      enseigne: texte(c.enseigne, 'nom du stand', { max: 80 }),
      but: parmi(c.but, BUTS, 'vous venez pour'),
      articles: texte(c.articles, 'articles à vendre ou à exposer', { min: 2, max: 500 }),
      categories: plusieurs(c.categories, CATEGORIES, 'catégorie'),
      courant: parmi(c.courant, ['Oui', 'Non'], 'électricité'),
    };
  } else {
    r.details = {
      structure: texte(c.structure, 'entreprise ou structure', { max: 100 }),
      fonction: texte(c.fonction, 'fonction', { max: 80, facultatif: true }),
      nature: plusieurs(c.nature, NATURES, 'nature du partenariat', { min: 1 }),
      message: texte(c.message, 'proposition', { max: 1000, facultatif: true }),
    };
  }
  return r;
}

export async function enregistrer(request, env, ctx) {
  if (Number(request.headers.get('Content-Length') || 0) > 16000) return json({ erreur: 'Demande trop longue.' }, 413);
  let corps;
  try { corps = await request.json(); } catch { return json({ erreur: 'Demande illisible.' }, 400); }
  // Champ piège invisible : seuls les robots le remplissent
  if (corps.site_web) return json({ ok: true });

  let r;
  try { r = valider(corps); } catch (e) {
    if (e instanceof ErreurSaisie) return json({ erreur: e.message }, 400);
    throw e;
  }
  const { meta } = await env.DB.prepare(
    'INSERT INTO reservations (type, nom, sexe, tel, email, jours, places, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).bind(r.type, r.nom, r.sexe, r.tel, r.email || null, r.jours, r.places, JSON.stringify(r.details)).run();

  ctx.waitUntil(envoyerMail(env, r).catch((e) => console.error('mail', e)));
  return json({ ok: true, id: meta.last_row_id });
}

// Lignes lisibles d'une demande, pour le mail et l'export
export function lignes(r) {
  const d = typeof r.details === 'string' ? JSON.parse(r.details) : r.details;
  const l = [['Demande', TITRES[r.type]], ['Nom', r.nom], ['Sexe', r.sexe], ['WhatsApp', '+225 ' + r.tel]];
  if (r.email) l.push(['E-mail', r.email]);
  if (r.type === 'public') l.push(['Jour', r.jours], ['Places', String(r.places)], ['Connu par', d.source.join(', ')]);
  if (r.type === 'stand') l.push(['Stand', d.enseigne], ['Pour', d.but], ['Articles', d.articles], ['Catégorie', d.categories.join(', ')], ['Jours', r.jours], ['Électricité', d.courant]);
  if (r.type === 'partenaire') l.push(['Structure', d.structure], ['Fonction', d.fonction], ['Partenariat', d.nature.join(', ')], ['Proposition', d.message]);
  return l.filter((x) => x[1]);
}

const echapper = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

async function envoyerMail(env, r) {
  if (!env.RESEND_API_KEY) return;
  const l = lignes(r);
  const sujet = `Réservation : ${TITRES[r.type]}, ${r.nom}` + (r.type === 'public' ? ` (${r.places} place${r.places > 1 ? 's' : ''})` : '');
  const html = `<h2 style="font-family:Arial,sans-serif;color:#43197F">Nouvelle demande sur le site du festival</h2>
<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${l.map(([k, v]) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#5B4D72">${echapper(k)}</td><td style="padding:6px 0;font-weight:bold">${echapper(v)}</td></tr>`).join('')}</table>
<p style="font-family:Arial,sans-serif;font-size:13px;color:#5B4D72">Toutes les demandes : page de l'équipe, /equipe/ sur le site.</p>`;
  const rep = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_EXPEDITEUR || 'Festival Abri2000 <onboarding@resend.dev>',
      to: [env.MAIL_EQUIPE],
      reply_to: r.email || undefined,
      subject: sujet,
      html,
      text: l.map(([k, v]) => `${k} : ${v}`).join('\n'),
    }),
  });
  if (!rep.ok) console.error('resend', rep.status, await rep.text());
}

export function json(donnees, status = 200, entetes = {}) {
  return new Response(JSON.stringify(donnees), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...entetes },
  });
}
