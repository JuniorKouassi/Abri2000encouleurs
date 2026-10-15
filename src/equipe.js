// Page privée de l'équipe : connexion par mot de passe, liste des demandes, suivi, export Excel.
import { json, SUIVIS } from './reservations.js';

const COOKIE = 'equipe';
const DUREE = 7 * 24 * 3600; // une semaine

async function hmac(cle, message) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(cle), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
// Comparaison à durée constante, en comparant les empreintes des deux valeurs
async function egal(a, b, cle) {
  const [x, y] = await Promise.all([hmac(cle, a), hmac(cle, b)]);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.min(x.length, y.length); i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

async function connecte(request, env) {
  const m = /(?:^|;\s*)equipe=([^;]+)/.exec(request.headers.get('Cookie') || '');
  if (!m || !env.CLE_SESSION) return false;
  const [expire, sig] = m[1].split('.');
  if (!expire || !sig || Number(expire) < Date.now() / 1000) return false;
  return egal(sig, await hmac(env.CLE_SESSION, expire), env.CLE_SESSION);
}

export async function routeEquipe(request, env, chemin) {
  const methode = request.method;
  // Les requêtes qui modifient doivent venir du site lui-même
  if (methode !== 'GET') {
    const origine = request.headers.get('Origin');
    if (origine && origine !== new URL(request.url).origin) return json({ erreur: 'Origine refusée.' }, 403);
  }

  if (chemin === '/api/equipe/connexion' && methode === 'POST') {
    if (!env.MOT_DE_PASSE_EQUIPE || !env.CLE_SESSION) return json({ erreur: "La page de l'équipe n'est pas encore configurée." }, 503);
    let corps = {};
    try { corps = await request.json(); } catch {}
    if (!(await egal(String(corps.mot_de_passe || ''), env.MOT_DE_PASSE_EQUIPE, env.CLE_SESSION))) {
      await new Promise((r) => setTimeout(r, 800)); // freine les essais en série
      return json({ erreur: 'Mot de passe incorrect.' }, 401);
    }
    const expire = String(Math.floor(Date.now() / 1000) + DUREE);
    const valeur = `${expire}.${await hmac(env.CLE_SESSION, expire)}`;
    return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=${valeur}; Path=/api/equipe; Max-Age=${DUREE}; HttpOnly; Secure; SameSite=Strict` });
  }
  if (chemin === '/api/equipe/deconnexion' && methode === 'POST') {
    return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=; Path=/api/equipe; Max-Age=0; HttpOnly; Secure; SameSite=Strict` });
  }

  if (!(await connecte(request, env))) return json({ erreur: 'Connexion requise.' }, 401);

  if (chemin === '/api/equipe/reservations' && methode === 'GET') {
    const [{ results }, totaux] = await Promise.all([
      env.DB.prepare('SELECT * FROM reservations ORDER BY cree_le DESC, id DESC').all(),
      env.DB.prepare(`SELECT
          COALESCE(SUM(CASE WHEN type = 'public' AND jours IN ('Vendredi 25', 'Les deux jours') THEN places END), 0) AS vendredi,
          COALESCE(SUM(CASE WHEN type = 'public' AND jours IN ('Samedi 26', 'Les deux jours') THEN places END), 0) AS samedi,
          COUNT(CASE WHEN type = 'stand' THEN 1 END) AS stands,
          COUNT(CASE WHEN type = 'partenaire' THEN 1 END) AS partenaires
        FROM reservations`).first(),
    ]);
    return json({ totaux, reservations: results.map((r) => ({ ...r, details: JSON.parse(r.details) })) });
  }

  const suivi = /^\/api\/equipe\/reservations\/(\d+)$/.exec(chemin);
  if (suivi && methode === 'PATCH') {
    let corps = {};
    try { corps = await request.json(); } catch {}
    if (!SUIVIS.includes(corps.suivi)) return json({ erreur: 'Suivi invalide.' }, 400);
    await env.DB.prepare('UPDATE reservations SET suivi = ? WHERE id = ?').bind(corps.suivi, Number(suivi[1])).run();
    return json({ ok: true });
  }

  if (chemin === '/api/equipe/export' && methode === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM reservations ORDER BY type, cree_le').all();
    const date = (iso) => new Date(iso).toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan', dateStyle: 'short', timeStyle: 'short' });
    const cellule = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const types = { public: 'Public', stand: 'Stand', partenaire: 'Partenaire' };
    const entete = ['N°', 'Reçue le', 'Type', 'Nom', 'Sexe', 'WhatsApp', 'E-mail', 'Jours', 'Places', 'Connu par',
      'Stand', 'Pour', 'Articles', 'Catégorie', 'Électricité', 'Structure', 'Fonction', 'Partenariat', 'Proposition', 'Suivi'];
    const rangees = results.map((r) => {
      const d = JSON.parse(r.details);
      const l = (x) => (x || []).join(', ');
      return [r.id, date(r.cree_le), types[r.type], r.nom, r.sexe, '+225 ' + r.tel, r.email, r.jours, r.type === 'public' ? r.places : '',
        l(d.source), d.enseigne, d.but, d.articles, l(d.categories), d.courant, d.structure, d.fonction, l(d.nature), d.message, r.suivi];
    });
    // Séparateur « ; » et BOM UTF-8 : Excel en français ouvre le fichier directement, accents compris
    const csv = '﻿' + [entete, ...rangees].map((l) => l.map(cellule).join(';')).join('\r\n');
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reservations-abri2000-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  return json({ erreur: 'Introuvable.' }, 404);
}
